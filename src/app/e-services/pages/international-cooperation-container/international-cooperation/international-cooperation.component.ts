import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {SaveTypes} from '@app/enums/save-types';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {FormManager} from '@app/models/form-manager';
import {FormBuilder, FormGroup} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {LangService} from '@app/services/lang.service';
import {exhaustMap, filter, map, takeUntil, tap} from 'rxjs/operators';
import {CaseStatus} from '@app/enums/case-status.enum';
import {IESComponent} from '@app/interfaces/iescomponent';
import {InternationalCooperation} from '@app/models/international-cooperation';
import {InternationalCooperationService} from '@app/services/international-cooperation.service';
import {InternalDepartmentService} from '@app/services/internal-department.service';
import {InternalDepartment} from '@app/models/internal-department';
import {CountryService} from '@app/services/country.service';
import {Country} from '@app/models/country';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {CaseModel} from '@app/models/case-model';

@Component({
  selector: 'international-cooperation',
  templateUrl: './international-cooperation.component.html',
  styleUrls: ['./international-cooperation.component.scss']
})
export class InternationalCooperationComponent implements OnInit, OnDestroy, IESComponent {
  countries: Country[] = [];
  departments: InternalDepartment[] = [];
  destroy$: Subject<any> = new Subject<any>();
  fm!: FormManager;
  form!: FormGroup;
  save: Subject<SaveTypes> = new Subject<SaveTypes>();
  saveTypes: typeof SaveTypes = SaveTypes;
  operation: OperationTypes = OperationTypes.CREATE;
  model?: InternationalCooperation;
  private outModelChange$: BehaviorSubject<InternationalCooperation> = new BehaviorSubject<InternationalCooperation>(null as unknown as InternationalCooperation);

  @Input()
  fromDialog: boolean = false;

  @Input()
  set outModel(model: InternationalCooperation) {
    this.outModelChange$.next(model);
  }

  get outModel(): InternationalCooperation {
    return this.outModelChange$.value;
  }

  private changeModel: BehaviorSubject<InternationalCooperation | undefined> = new BehaviorSubject<InternationalCooperation | undefined>(new InternationalCooperation());
  private modelChange$: Observable<InternationalCooperation | undefined> = this.changeModel.asObservable();
  readonly: boolean = false;
  allowEditRecommendations: boolean = true;

  constructor(private http: HttpClient,
              public intDepService: InternalDepartmentService,
              public service: InternationalCooperationService,
              private fb: FormBuilder,
              private dialog: DialogService,
              private toast: ToastService,
              private countryService: CountryService,
              public lang: LangService) {
  }

  ngOnInit(): void {
    this.service.ping();
    this.loadDepartments();
    this.buildForm();
    this.listenToSave();
    this.listenToModelChange();
    this.listenToOutModelChange();
    this.loadCountries();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  private buildForm() {
    const internationalCooperation = new InternationalCooperation();
    this.form = this.fb.group(internationalCooperation.getFormFields(true));
    this.fm = new FormManager(this.form, this.lang);
  }

  private loadDepartments(): void {
    this.intDepService.loadDepartments()
      .pipe(takeUntil(this.destroy$))
      .subscribe(deps => this.departments = deps);
  }

  private listenToSave(): void {
    const validFormSubmit$ = this.save.pipe(
      filter(val => val === SaveTypes.FINAL || val === SaveTypes.COMMIT),
      tap(_ => (!this.form.valid ? this.displayInvalidFormMessage() : null)),
      filter(_ => this.form.valid),
    );

    const finalSave$ = validFormSubmit$
      .pipe(filter(val => val === SaveTypes.FINAL), map(_ => this.form.value));
    const commitSave$ = validFormSubmit$
      .pipe(filter(val => val === SaveTypes.COMMIT), map(_ => this.form.value));

    const draftSave$ = this.save
      .pipe(filter(val => val === SaveTypes.DRAFT), map(_ => this.form.value));

    this.listenToDraftSave(draftSave$);
    this.listenToFinalSave(finalSave$);
    this.listenToCommitSave(commitSave$);
  }

  private listenToDraftSave(draftSave$: Observable<any>): void {
    draftSave$.pipe(takeUntil(this.destroy$)).subscribe((fromValues) => {
      const model = (new InternationalCooperation()).clone({...this.model, ...fromValues});
      model.draft()
        .pipe(takeUntil(this.destroy$), tap(_ => this.saveDraftMessage()))
        .subscribe((model) => this.changeModel.next(model));
    });
  }

  private listenToFinalSave(finalSave$: Observable<any>): void {
    finalSave$.pipe(
      takeUntil(this.destroy$),
      exhaustMap((fromValues) => {
        const model = (new InternationalCooperation()).clone({...this.model, ...fromValues});
        return model.save().pipe(takeUntil(this.destroy$), tap(model => this.saveMessage(model)))
      })
    ).subscribe((model) => {
      this.changeModel.next(model)
    });
  }


  private listenToCommitSave(commitSave$: Observable<any>) {
    commitSave$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(fromValues => {
      const model = (new InternationalCooperation()).clone({...this.model, ...fromValues});
      model.commit().pipe(takeUntil(this.destroy$), tap(model => this.saveMessage(model)))
        .subscribe((model) => this.changeModel.next(model));
    });
  }

  onCompetentDepChange(depId: number): void {
    const dep = this.departments.find(item => item.id === depId);
    dep ? this.setAuthName(dep) : this.setAuthName(null);
  }

  setAuthName(dep: InternalDepartment | null): void {
    this.fm.getFormField('competentDepartmentAuthName')?.setValue(dep ? dep.mainTeam.authName : null);
  }

  private displayInvalidFormMessage(): void {
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled).onAfterClose$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.fm.displayFormValidity());
  }

  private listenToModelChange(): void {
    this.modelChange$
      .pipe(
        takeUntil(this.destroy$),
        tap((item) => this.model = item),
      )
      .subscribe((model) => {
        model ? this.updateFromFields(model) : this.form.reset();
      });
  }

  private updateFromFields(model: InternationalCooperation): void {
    this.form.patchValue(model.getFormFields());
  }

  private saveDraftMessage(): void {
    this.toast.success(this.lang.map.draft_was_saved_successfully);
  }

  private saveMessage(model: CaseModel<any, any>): void {
    if (this.operation === OperationTypes.CREATE) {
      this.dialog.success(this.lang.map.msg_request_has_been_added_successfully.change({serial: model.fullSerial}));
      this.operation = OperationTypes.UPDATE;
    } else {
      this.toast.success(this.lang.map.request_has_been_saved_successfully);
    }
  }

  launch() {
    this.model?.start().subscribe(_ => {
      if (this.model) {
        this.model.caseStatus = CaseStatus.STARTED;
        this.form.reset();
        this.model = undefined;
        this.operation = OperationTypes.CREATE;
      }
      this.toast.success(this.lang.map.request_has_been_sent_successfully);
    });
  }

  private listenToOutModelChange() {
    this.outModelChange$
      .pipe(
        filter(model => !!model),
        takeUntil(this.destroy$)
      )
      .subscribe((model) => {
        this.changeModel.next(model);
      });
  }

  private loadCountries() {
    this.countryService
      .load()
      .pipe(takeUntil(this.destroy$))
      .subscribe((countries) => this.countries = countries);
  }
}
