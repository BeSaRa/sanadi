import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {SaveTypes} from '../../../../enums/save-types';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {FormManager} from '../../../../models/form-manager';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Lookup} from '../../../../models/lookup';
import {HttpClient} from '@angular/common/http';
import {DialogService} from '../../../../services/dialog.service';
import {LookupService} from '../../../../services/lookup.service';
import {ToastService} from '../../../../services/toast.service';
import {LangService} from '../../../../services/lang.service';
import {filter, map, takeUntil, tap} from 'rxjs/operators';
import {CaseStatus} from '../../../../enums/case-status.enum';
import {IESComponent} from '../../../../interfaces/iescomponent';
import {InternationalCooperation} from '../../../../models/international-cooperation';
import {InternationalCooperationService} from '../../../../services/international-cooperation.service';
import {InternalDepartmentService} from '../../../../services/internal-department.service';
import {InternalDepartment} from '../../../../models/internal-department';

@Component({
  selector: 'international-cooperation',
  templateUrl: './international-cooperation.component.html',
  styleUrls: ['./international-cooperation.component.scss']
})
export class InternationalCooperationComponent implements OnInit, OnDestroy, IESComponent {
  countries: Lookup[] = this.lookupService.listByCategory.Countries;
  departments: InternalDepartment[] = [];
  destroy$: Subject<any> = new Subject<any>();
  fm!: FormManager;
  form!: FormGroup;
  save: Subject<SaveTypes> = new Subject<SaveTypes>();
  saveTypes: typeof SaveTypes = SaveTypes;
  editMode: boolean = false;
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
  allowMange: boolean = true;
  constructor(private http: HttpClient,
              public intDepService: InternalDepartmentService,
              public service: InternationalCooperationService,
              private fb: FormBuilder,
              private dialog: DialogService,
              private lookupService: LookupService,
              private toast: ToastService,
              public lang: LangService) {
  }

  ngOnInit(): void {
    this.service.ping();
    this.loadDepartments();
    this.buildForm();
    this.listenToSave();
    this.listenToModelChange();
    this.listenToOutModelChange();
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
      takeUntil(this.destroy$)
    ).subscribe((fromValues) => {
      const model = (new InternationalCooperation()).clone({...this.model, ...fromValues});
      model.save().pipe(takeUntil(this.destroy$), tap(_ => this.saveMessage()))
        .subscribe((model) => this.changeModel.next(model));
    });
  }


  private listenToCommitSave(commitSave$: Observable<any>) {
    commitSave$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(fromValues => {
      const model = (new InternationalCooperation()).clone({...this.model, ...fromValues});
      model.commit().pipe(takeUntil(this.destroy$), tap(_ => this.saveMessage()))
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

  private saveMessage(): void {
    this.toast.success(this.lang.map.request_has_been_saved_successfully);
  }

  launch() {
    this.model?.start().subscribe(_ => {
      if (this.model) {
        this.model.caseStatus = CaseStatus.STARTED;
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
}
