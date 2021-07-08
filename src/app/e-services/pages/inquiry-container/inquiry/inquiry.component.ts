import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {LangService} from '../../../../services/lang.service';
import {InternalDepartmentService} from '../../../../services/internal-department.service';
import {InternalDepartment} from '../../../../models/internal-department';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {filter, map, takeUntil, tap} from 'rxjs/operators';
import {FormManager} from '../../../../models/form-manager';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Inquiry} from '../../../../models/inquiry';
import {LookupService} from '../../../../services/lookup.service';
import {Lookup} from '../../../../models/lookup';
import {SaveTypes} from '../../../../enums/save-types';
import {DialogService} from '../../../../services/dialog.service';
import {ToastService} from '../../../../services/toast.service';
import {InquiryService} from '../../../../services/inquiry.service';
import {CaseStatus} from '../../../../enums/case-status.enum';
import {IESComponent} from '../../../../interfaces/iescomponent';
import {CustomValidators} from '../../../../validators/custom-validators';
import {OperationTypes} from '../../../../enums/operation-types.enum';
import {CaseModel} from '../../../../models/case-model';

@Component({
  selector: 'inquiry-component',
  templateUrl: './inquiry.component.html',
  styleUrls: ['./inquiry.component.scss']
})
export class InquiryComponent implements OnInit, OnDestroy, IESComponent {
  departments: InternalDepartment[] = [];
  destroy$: Subject<any> = new Subject<any>();
  fm!: FormManager;
  form!: FormGroup;
  categories: Lookup[] = this.lookupService.listByCategory.InquiryCategory;
  save: Subject<SaveTypes> = new Subject<SaveTypes>();
  saveTypes: typeof SaveTypes = SaveTypes;
  operation: OperationTypes = OperationTypes.CREATE;
  model?: Inquiry;
  private outModelChange$: BehaviorSubject<Inquiry> = new BehaviorSubject<Inquiry>(null as unknown as Inquiry);

  @Input()
  fromDialog: boolean = false;

  @Input()
  set outModel(model: Inquiry) {
    this.outModelChange$.next(model);
  }

  get outModel(): Inquiry {
    return this.outModelChange$.value;
  }

  private changeModel: BehaviorSubject<Inquiry | undefined> = new BehaviorSubject<Inquiry | undefined>(new Inquiry());
  private modelChange$: Observable<Inquiry | undefined> = this.changeModel.asObservable();

  inputMaskPatterns: typeof CustomValidators.inputMaskPatterns = CustomValidators.inputMaskPatterns;

  readonly: boolean = false;
  allowEditRecommendations: boolean = true;

  constructor(private http: HttpClient,
              public service: InquiryService,
              private intDepService: InternalDepartmentService,
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

  private loadDepartments(): void {
    this.intDepService.loadDepartments()
      .pipe(takeUntil(this.destroy$))
      .subscribe(deps => this.departments = deps);
  }

  private buildForm() {
    const inquiry = new Inquiry();
    this.form = this.fb.group(inquiry.getFormFields(true));
    this.fm = new FormManager(this.form, this.lang);
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
      const model = (new Inquiry()).clone({...this.model, ...fromValues});
      model.draft()
        .pipe(takeUntil(this.destroy$), tap(_ => this.saveDraftMessage()))
        .subscribe((model) => this.changeModel.next(model));
    });
  }

  private listenToFinalSave(finalSave$: Observable<any>): void {
    finalSave$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((fromValues) => {
      const model = (new Inquiry()).clone({...this.model, ...fromValues});
      model.save().pipe(takeUntil(this.destroy$), tap(model => this.saveMessage(model)))
        .subscribe((model) => this.changeModel.next(model));
    });
  }


  private listenToCommitSave(commitSave$: Observable<any>) {
    commitSave$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(fromValues => {
      const model = (new Inquiry()).clone({...this.model, ...fromValues});
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

  private updateFromFields(model: Inquiry): void {
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
}
