import {Component} from '@angular/core';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {Consultation} from '@app/models/consultation';
import {LangService} from '@services/lang.service';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {OpenFrom} from '@app/enums/open-from.enum';
import {TabMap} from '@app/types/types';
import {CustomValidators} from '@app/validators/custom-validators';
import {DialogService} from '@services/dialog.service';
import {LookupService} from '@services/lookup.service';
import {ToastService} from '@services/toast.service';
import {EmployeeService} from '@services/employee.service';
import {InternalDepartmentService} from '@services/internal-department.service';
import {map, takeUntil} from 'rxjs/operators';
import {InternalDepartment} from '@app/models/internal-department';
import {SaveTypes} from '@app/enums/save-types';
import {forkJoin, Observable} from 'rxjs';
import {Lookup} from '@app/models/lookup';
import {CommonUtils} from '@helpers/common-utils';
import {CommonCaseStatus} from '@app/enums/common-case-status.enum';
import {ConsultationService} from '@services/consultation.service';
import {ProfileService} from '@services/profile.service';
import {Profile} from '@app/models/profile';
import {ServiceDataService} from "@services/service-data.service";
import {CaseTypes} from "@enums/case-types.enum";

@Component({
  selector: 'consultation',
  templateUrl: './consultation.component.html',
  styleUrls: ['./consultation.component.scss']
})
export class ConsultationComponent extends EServicesGenericComponent<Consultation, ConsultationService> {

  constructor(public lang: LangService,
              public service: ConsultationService,
              public fb: UntypedFormBuilder,
              private dialog: DialogService,
              private lookupService: LookupService,
              private toast: ToastService,
              public employeeService: EmployeeService,
              private intDepService: InternalDepartmentService,
              private serviceDataService: ServiceDataService,
              private profileService: ProfileService) {
    super();
  }

  form!: UntypedFormGroup;
  operation: OperationTypes = OperationTypes.CREATE;
  readonly: boolean = false;
  departments: InternalDepartment[] = [];
  organizations: Profile[] = [];
  categories: Lookup[] = this.lookupService.listByCategory.ConsultationCategory;
  allowEditRecommendations: boolean = true;
  loadAttachments: boolean = false;
  public isInternalUser: boolean = this.employeeService.isInternalUser();

  tabsData: TabMap = {
    basicInfo: {
      index: 0,
      name: 'basicInfoTab',
      langKey: 'lbl_basic_info',
      validStatus: () => this.form && this.form.valid,
      isTouchedOrDirty: () => true
    },
    comments: {
      index: 1,
      name: 'commentsTab',
      langKey: 'comments',
      validStatus: () => true,
      isTouchedOrDirty: () => true
    },
    attachments: {
      index: 2,
      name: 'attachmentsTab',
      langKey: 'attachments',
      validStatus: () => true,
      isTouchedOrDirty: () => true
    },
    recommendations: {
      index: 4,
      name: 'recommendations',
      langKey: 'recommendations',
      validStatus: () => true,
      isTouchedOrDirty: () => true
    }
  };

  _initComponent(): void {
    this.loadOrganizations();
    if (this.isInternalUser) {
      this.loadDepartmentsByCaseType();
    }
  }

  _buildForm(): void {
    const consultation = this._getNewInstance();
    this.form = this.fb.group(consultation.getFormFields(true));
  }

  _afterBuildForm(): void {
    this.setDefaultValuesForExternalUser();
    if (this.isInternalUser) {
      this.competentDepartmentIdField?.setValidators(CustomValidators.required);
      this.competentDepartmentIdField?.updateValueAndValidity();
    } else {
      this.organizationField?.disable();
    }
  }

  private _updateModelAfterSave(model: Consultation): void {
    if ((this.openFrom === OpenFrom.USER_INBOX || this.openFrom === OpenFrom.TEAM_INBOX) && this.model?.taskDetails && this.model.taskDetails.tkiid) {
      this.service.getTask(this.model.taskDetails.tkiid)
        .subscribe((model) => {
          this.model = model;
        });
    } else {
      this.model = model;
    }
  }

  _afterSave(model: Consultation, saveType: SaveTypes, operation: OperationTypes): void {
    this._updateModelAfterSave(model);

    if (
      (operation === OperationTypes.CREATE && saveType === SaveTypes.FINAL) ||
      (operation === OperationTypes.UPDATE && saveType === SaveTypes.COMMIT)
    ) {
      this.dialog.success(this.lang.map.msg_request_has_been_added_successfully.change({serial: model.fullSerial}));
    } else {
      this.toast.success(this.lang.map.request_has_been_saved_successfully);
    }
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (saveType === SaveTypes.DRAFT) {
      return true;
    }
    if (this.form.invalid) {
      this.displayInvalidFormMessage();
      return false;
    }
    return true;
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    return !!this.model && this.form.valid && this.model.canStart();
  }

  _afterLaunch(): void {
    this.resetForm$.next();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }

  _launchFail(error: any): void {
  }

  _destroyComponent(): void {
  }

  _getNewInstance(): Consultation {
    return new Consultation();
  }

  _prepareModel(): Observable<Consultation> | Consultation {
    return this._getNewInstance().clone({
      ...this.model,
      ...this.form.value
    });
  }

  _resetForm(): void {
    this.form.reset();
    this.model = this._getNewInstance();
    this.operation = OperationTypes.CREATE;
    this.setDefaultValuesForExternalUser();
  }

  _saveFail(error: any): void {
  }

  _updateForm(model: Consultation | undefined): void {
    this.model = model;
    if (!model) {
      return;
    }
    this.form.patchValue(model.getFormFields());
    this.refillFromView();
  }

  onCompetentDepChange(depId: number): void {
    const dep = this.departments.find(item => item.id === depId);
    dep ? this._setAuthName(dep) : this._setAuthName(null);
  }

  private _setAuthName(dep: InternalDepartment | null): void {
    this.competentDepartmentAuthNameField?.setValue(dep ? dep.mainTeam.authName : null);
  }

  private refillFromView(): void {
    if (!this.model || !this.model.id) {
      return;
    }

    const orgExists = this.organizations.find(i => i.id === this.model?.organizationId);
    if (!orgExists) {
      this.organizations = this.organizations.concat(new Profile().clone({
        id: this.model.organizationInfo.id,
        arName: this.model.organizationInfo.arName,
        enName: this.model.organizationInfo.enName,
      }));
    }
  }

  private setDefaultValuesForExternalUser(): void {
    if (!this.employeeService.isExternalUser() || (this.model && this.model.id)) {
      return;
    }
    const user = this.employeeService.getExternalUser();
    this.organizationField?.patchValue(this.employeeService.getProfile()?.id);
    this.fullNameField?.patchValue(user?.getName());
    this.emailField?.patchValue(user?.email);
    this.mobileNumberField?.patchValue(user?.phoneNumber);
  }

  private loadOrganizations(): void {
    this.profileService.loadActive().pipe(takeUntil(this.destroy$))
      .subscribe(organizations => {
        this.organizations = organizations;
      });
  }

  private loadDepartmentsByCaseType(): void {
    const serviceData = this.serviceDataService.loadByCaseType(CaseTypes.CONSULTATION)
      .pipe(
        map(result => result.concernedDepartmentsIdsParsed ?? []),
      );

    const internalDepartments = this.intDepService.loadAsLookups()

    forkJoin([serviceData, internalDepartments])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([relatedDepartments, allDepartments]) => {
        this.departments = allDepartments.filter(dep => {
          return relatedDepartments.includes(dep.id);
        });
      })
  }

  get competentDepartmentAuthNameField(): UntypedFormControl {
    return this.form.get('competentDepartmentAuthName') as UntypedFormControl;
  }

  get competentDepartmentIdField(): UntypedFormControl {
    return this.form.get('competentDepartmentID') as UntypedFormControl;
  }

  get organizationField(): UntypedFormControl {
    return this.form.get('organizationId') as UntypedFormControl;
  }

  get fullNameField(): UntypedFormControl {
    return this.form.get('fullName') as UntypedFormControl;
  }

  get emailField(): UntypedFormControl {
    return this.form.get('email') as UntypedFormControl;
  }

  get mobileNumberField(): UntypedFormControl {
    return this.form.get('mobileNo') as UntypedFormControl;
  }

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }

  private displayInvalidFormMessage(): void {
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled).onAfterClose$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => CommonUtils.displayFormValidity(this.form, 'main-content'));
  }

  private _getInvalidTabs(): any {
    let failedList: string[] = [];
    for (const key in this.tabsData) {
      if (!(this.tabsData[key].validStatus())) {
        // @ts-ignore
        failedList.push(this.lang.map[this.tabsData[key].langKey]);
      }
    }
    return failedList;
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
      let caseStatus = this.model.getCaseStatus();
      isAllowed = (caseStatus !== CommonCaseStatus.CANCELLED && caseStatus !== CommonCaseStatus.FINAL_APPROVE && caseStatus !== CommonCaseStatus.FINAL_REJECTION);
    }

    return !isAllowed;
  }
}
