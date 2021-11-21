import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {IESComponent} from '@app/interfaces/iescomponent';
import {FormBuilder, FormGroup} from '@angular/forms';
import {SaveTypes} from '@app/enums/save-types';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {Consultation} from '@app/models/consultation';
import {FormManager} from '@app/models/form-manager';
import {Lookup} from '@app/models/lookup';
import {LookupService} from '@app/services/lookup.service';
import {HttpClient} from '@angular/common/http';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {LangService} from '@app/services/lang.service';
import {ConsultationService} from '@app/services/consultation.service';
import {exhaustMap, filter, map, takeUntil, tap} from 'rxjs/operators';
import {OrgUnit} from '@app/models/org-unit';
import {OrganizationUnitService} from '@app/services/organization-unit.service';
import {CaseStatus} from '@app/enums/case-status.enum';
import {InternalDepartment} from '@app/models/internal-department';
import {InternalDepartmentService} from '@app/services/internal-department.service';
import {EmployeeService} from '@app/services/employee.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {CaseModel} from '@app/models/case-model';
import {OpenFrom} from '@app/enums/open-from.enum';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';

@Component({
  selector: 'consultation',
  templateUrl: './consultation.component.html',
  styleUrls: ['./consultation.component.scss']
})
export class ConsultationComponent implements OnInit, OnDestroy, IESComponent {
  departments: InternalDepartment[] = [];
  organizations: OrgUnit[] = [];
  destroy$: Subject<any> = new Subject<any>();
  saveTypes: typeof SaveTypes = SaveTypes;
  form!: FormGroup;
  fm!: FormManager;
  categories: Lookup[] = this.lookupService.listByCategory.ConsultationCategory;
  save: Subject<SaveTypes> = new Subject<SaveTypes>();
  model?: Consultation;
  operation: OperationTypes = OperationTypes.CREATE;
  openFrom: OpenFrom = OpenFrom.ADD_SCREEN;
  public isInternalUser: boolean = this.employeeService.isInternalUser();
  private outModelChange$: BehaviorSubject<Consultation> = new BehaviorSubject<Consultation>(null as unknown as Consultation);

  private changeModel: BehaviorSubject<Consultation | undefined> = new BehaviorSubject<Consultation | undefined>(new Consultation());
  private modelChange$: Observable<Consultation | undefined> = this.changeModel.asObservable();

  @Input()
  fromDialog: boolean = false;

  @Input()
  set outModel(model: Consultation) {
    this.outModelChange$.next(model);
  }

  get outModel(): Consultation {
    return this.outModelChange$.value;
  }

  readonly: boolean = false;
  allowEditRecommendations: boolean = true;

  tabsData: IKeyValue = {
    basicInfo: {
      name: 'basicInfoTab',
      langKey: 'lbl_basic_info' as keyof ILanguageKeys,
      validStatus: () => this.form.valid
    },
    comments: {
      name: 'commentsTab',
      langKey: 'comments',
      validStatus: () => true
    },
    attachments: {
      name: 'attachmentsTab',
      langKey: 'attachments',
      validStatus: () => true
    },
    recommendations: {
      name: 'recommendations',
      langKey: 'recommendations',
      validStatus: () => true
    }
  };

  constructor(private http: HttpClient,
              public service: ConsultationService,
              private fb: FormBuilder,
              private dialog: DialogService,
              private lookupService: LookupService,
              private toast: ToastService,
              public employeeService: EmployeeService,
              private intDepService: InternalDepartmentService,
              public lang: LangService,
              private orgUnitService: OrganizationUnitService) {
  }

  ngOnInit(): void {
    this.service.ping();
    this.loadOrganizations();
    if (this.isInternalUser) {
      this.loadDepartments();
    }
    this.buildForm();
    this.listenToSave();
    this.listenToModelChange();
    this.listenToOutModelChange();
    this.setDefaultValuesForExternalUser();
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

  private loadOrganizations(): void {
    this.orgUnitService.loadActive().pipe(takeUntil(this.destroy$))
      .subscribe(organizations => this.organizations = organizations);
  }

  private buildForm(): void {
    const consultation = new Consultation();
    this.form = this.fb.group(consultation.getFormFields(true));
    this.fm = new FormManager(this.form, this.lang);

    if (this.isInternalUser) {
      this.form.get('competentDepartmentID')?.setValidators(CustomValidators.required);
      this.form.get('competentDepartmentID')?.updateValueAndValidity();
    }
    if (this.employeeService.isExternalUser()) {
      this.form.get('organizationId')?.disable();
    }
  }

  private listenToSave() {
    const validFormSubmit$ = this.save.pipe(
      filter(val => val === SaveTypes.FINAL || val === SaveTypes.COMMIT),
      tap(_ => !this.form.valid ? this.displayInvalidFormMessage() : null),
      filter(_ => this.form.valid));

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

  launch() {
    this.model?.start().subscribe(_ => {
      if (this.model) {
        this.model.caseStatus = CaseStatus.STARTED;
        this.resetForm();
        this.model = undefined;
        this.operation = OperationTypes.CREATE;
      }
      this.toast.success(this.lang.map.request_has_been_sent_successfully);
    });
  }

  private displayInvalidFormMessage(): void {
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled).onAfterClose$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.fm.displayFormValidity());
  }

  private listenToDraftSave(draftSave$: Observable<any>): void {
    draftSave$.pipe(takeUntil(this.destroy$)).subscribe((fromValues) => {
      const model = (new Consultation()).clone({...this.model, ...fromValues});
      model.draft()
        .pipe(takeUntil(this.destroy$), tap(_ => this.saveDraftMessage()))
        .subscribe((model) => this.changeModel.next(model));
    });
  }

  private listenToFinalSave(finalSave$: Observable<any>): void {
    finalSave$.pipe(
      takeUntil(this.destroy$),
      exhaustMap((fromValues) => {
        const model = (new Consultation()).clone({...this.model, ...fromValues});
        return model.save().pipe(takeUntil(this.destroy$), tap(model => this.saveMessage(model)))
      })
    ).subscribe((model) => {
      this.changeModel.next(model)
    });
  }

  private listenToCommitSave(commitSave$: Observable<any>): void {
    commitSave$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((fromValues) => {
      const model = (new Consultation()).clone({...this.model, ...fromValues});
      model.save().pipe(takeUntil(this.destroy$), tap(model => this.saveMessage(model)))
        .subscribe((model) => this.changeModel.next(model));
    });
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

  private listenToModelChange(): void {
    this.modelChange$.pipe(
      takeUntil(this.destroy$),
      tap(item => this.model = item)
    ).subscribe((model) => {
      // this.toggleOrganizationListStatus();
      model ? this.updateFromFields(model) : this.resetForm();
    });
  }

  private updateFromFields(model: Consultation): void {
    this.form.patchValue(model.getFormFields());
  }

  private listenToOutModelChange(): void {
    this.outModelChange$
      .pipe(
        filter(model => !!model),
        takeUntil(this.destroy$)
      )
      .subscribe((model) => {
        this.changeModel.next(model);
      });
  }

  onCompetentDepChange(depId: number): void {
    const dep = this.departments.find(item => item.id === depId);
    dep ? this.setAuthName(dep) : this.setAuthName(null);
  }

  setAuthName(dep: InternalDepartment | null): void {
    this.fm.getFormField('competentDepartmentAuthName')?.setValue(dep ? dep.mainTeam.authName : null);
  }

  toggleOrganizationListStatus(): void {
    this.model && this.model.id ? this.form.get('organizationId')?.disable() : this.form.get('organizationId')?.enable();
  }

  resetForm(): void {
    this.form.reset();
    this.setDefaultValuesForExternalUser();
  }

  private setDefaultValuesForExternalUser(): void {
    if (!this.employeeService.isExternalUser() || (this.model && this.model.id)) {
      return;
    }
    this.form.get('organizationId')?.patchValue(this.employeeService.getOrgUnit()?.id);
    this.form.get('fullName')?.patchValue(this.employeeService.getUser()?.getName());
    this.form.get('email')?.patchValue(this.employeeService.getUser()?.email);
    this.form.get('mobileNo')?.patchValue(this.employeeService.getUser()?.phoneNumber);
  }

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }

  isAddCommentAllowed(): boolean {
    if (!this.model?.id || this.employeeService.isExternalUser()) {
      return false;
    }
    let isAllowed = true;
    if (this.openFrom === OpenFrom.TEAM_INBOX) {
      isAllowed = this.model.taskDetails.isClaimed();
    }
    return isAllowed;
  }

  isAttachmentReadonly(): boolean {
    if (!this.model?.id) {
      return false;
    }
    let isAllowed = true;
    if (this.openFrom === OpenFrom.TEAM_INBOX) {
      isAllowed = this.model.taskDetails.isClaimed();
    }
    if (isAllowed) {
      let caseStatus = this.model.getCaseStatus(),
        caseStatusEnum = this.service.caseStatusEnumMap[this.model.getCaseType()];

      if (caseStatusEnum) {
        isAllowed = (caseStatus !== caseStatusEnum.CANCELLED && caseStatus !== caseStatusEnum.FINAL_APPROVE && caseStatus !== caseStatusEnum.FINAL_REJECTION);
      }
    }

    return !isAllowed;
  }
}
