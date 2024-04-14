import { ApprovalTemplateTypeEnum } from '@enums/approvalTemplateType.enum';
import {CustomServiceTemplateService} from '@services/custom-service-template.service';
import {JobTitleService} from '@services/job-title.service';
import {ExternalUser} from '@models/external-user';
import {ExternalUserService} from '@services/external-user.service';
import {AdminLookupService} from '@services/admin-lookup.service';
import {ChangeDetectorRef, Component} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators,} from '@angular/forms';
import {AdminLookupTypeEnum} from '@enums/admin-lookup-type-enum';
import {CommonCaseStatus} from '@enums/common-case-status.enum';
import {OpenFrom} from '@enums/open-from.enum';
import {OperationTypes} from '@enums/operation-types.enum';
import {SaveTypes} from '@enums/save-types';
import {ServiceRequestTypes} from '@enums/service-request-types';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {CommonUtils} from '@helpers/common-utils';
import {AdminLookup} from '@models/admin-lookup';
import {Lookup} from '@models/lookup';
import {OrganizationsEntitiesSupport} from '@models/organizations-entities-support';
import {OrganizationsEntitiesSupportSearchCriteria} from '@models/organizations-entities-support-search-criteria';
import {DialogService} from '@services/dialog.service';
import {EmployeeService} from '@services/employee.service';
import {LangService} from '@services/lang.service';
import {LookupService} from '@services/lookup.service';
import {OrganizationsEntitiesSupportService} from '@services/organizations-entities-support.service';
import {ToastService} from '@services/toast.service';
import {TabComponent} from '@app/shared/components/tab/tab.component';
import {TabMap} from '@app/types/types';
import {CustomValidators} from '@app/validators/custom-validators';
import {Observable, of, Subject} from 'rxjs';
import {catchError, map, switchMap, takeUntil, tap,} from 'rxjs/operators';
import {JobTitle} from '@models/job-title';
import {
  SelectCustomServiceTemplatePopupComponent
} from '@app/modules/services/shared-services/popups/select-custom-service-template-popup/select-custom-service-template-popup.component';
import {FileExtensionsEnum} from '@app/enums/file-extension-mime-types-icons.enum';
import {CustomServiceTemplate} from '@app/models/custom-service-template';

@Component({
  selector: 'app-organizations-entities-support',
  templateUrl: './organizations-entities-support.component.html',
  styleUrls: ['./organizations-entities-support.component.scss'],
})
export class OrganizationsEntitiesSupportComponent extends EServicesGenericComponent<OrganizationsEntitiesSupport, OrganizationsEntitiesSupportService> {
  constructor(public lang: LangService,
              private cd: ChangeDetectorRef,
              private toastService: ToastService,
              private dialogService: DialogService,
              public fb: UntypedFormBuilder,
              private customServiceTemplate: CustomServiceTemplateService,
              public service: OrganizationsEntitiesSupportService,
              private lookupService: LookupService,
              public employeeService: EmployeeService,
              private adminLookupService: AdminLookupService,
              private externalUserService: ExternalUserService,
              private jobTitleService: JobTitleService) {
    super();
  }

  form!: UntypedFormGroup;
  fileExtensionsEnum = FileExtensionsEnum;
  loadAttachments: boolean = false;
  requestTypesList: Lookup[] = this.lookupService.listByCategory.RequestTypeNewOnly;
  serviceTypes: AdminLookup[] = [];
  licenseSearch$: Subject<string> = new Subject<string>();
  externalUsersList: ExternalUser[] = [];
  jobTitleList: JobTitle[] = [];
  selectedLicense?: OrganizationsEntitiesSupport;
  selectedTemplate!: CustomServiceTemplate;
  selectedTemplateControl: UntypedFormControl = new UntypedFormControl(null, [Validators.required]);
  showOtherService: boolean = false;
  openFromEnum = OpenFrom;
  formProperties = {
    requestType: () => {
      return this.getObservableField('requestTypeField', 'requestType');
    },
  };

  tabsData: TabMap = {
    basicInfo: {
      name: 'basicInfoTab',
      langKey: 'lbl_basic_info',
      index: 0,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => this.basicInfoTab.valid && (!this.isLicensingUser || this.selectedTemplateControl.valid),
    },
    beneficiaryGroup: {
      name: 'beneficiaryGroupTab',
      langKey: 'beneficiaries_type',
      index: 1,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => {
        return this.beneficiaryGroup && this.beneficiaryGroup.valid;
      },
    },
    organizationOfficer: {
      name: 'organizationOfficer',
      langKey: 'contact_officer',
      index: 2,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => true,
      show: () => true,
      validStatus: () => {
        return (
          this.organizationOfficerGroup && this.organizationOfficerGroup.valid
        );
      },
    },
    specialExplanations: {
      name: 'specialExplanationsTab',
      langKey: 'special_explanations',
      index: 3,
      isTouchedOrDirty: () => true,
      show: () => true,
      validStatus: () =>
        this.specialExplanationsField && this.specialExplanationsField.valid,
    },
    attachments: {
      name: 'attachmentsTab',
      langKey: 'attachments',
      index: 10,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => true,
    },
  };
  tabIndex$: Subject<number> = new Subject<number>();

  ngAfterViewInit(): void {
    this._listenToServiceType();
    this.cd.detectChanges();
  }


  _initComponent(): void {
    this._loadExternalUsers();
    this._loadActivityTypes();
    this._loadJobTitles();
  }

  _buildForm(): void {
    let objOrganizationsEntitiesSupport = this._getNewInstance();
    this.form = this.fb.group({
      basicInfo: this.fb.group(
        objOrganizationsEntitiesSupport.getBasicInfoFields(true)
      ),
      beneficiary: this.fb.group(
        objOrganizationsEntitiesSupport.getBeneficiariesTypeFields(true)
      ),
      organizationOfficer: this.fb.group(
        objOrganizationsEntitiesSupport.getOrganizationOfficerFields(true)
      ),
      description: this.fb.control(objOrganizationsEntitiesSupport.description),
    });

    this.organizationId.patchValue(this.employeeService.getProfile()?.id!);
  }

  _afterBuildForm(): void {
    this.handleReadonly();
    if (!this.model?.id) {
      this._setDefaultValues();
    }
  }

  _afterLaunch(): void {
    this.resetForm$.next();
    this.toastService.success(this.lang.map.request_has_been_sent_successfully);
  }

  _afterSave(
    model: OrganizationsEntitiesSupport,
    saveType: SaveTypes,
    operation: OperationTypes
  ): void {
    this._updateModelAfterSave(model);

    if (
      (operation === OperationTypes.CREATE && saveType === SaveTypes.FINAL) ||
      (operation === OperationTypes.UPDATE && saveType === SaveTypes.COMMIT)
    ) {
      this.dialogService.success(
        this.lang.map.msg_request_has_been_added_successfully.change({
          serial: model.fullSerial,
        })
      );
    } else {
      this.toastService.success(
        this.lang.map.request_has_been_saved_successfully
      );
    }
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    return !!this.model && this.form.valid && this.model.canStart();
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (
      this.requestTypeField.value !== ServiceRequestTypes.NEW &&
      !this.selectedLicense
    ) {
      this.dialogService.error(
        this.lang.map.please_select_license_to_complete_save
      );
      return false;
    } else {
      if (saveType === SaveTypes.DRAFT) {
        return true;
      }
      const invalidTabs = this._getInvalidTabs();
      if (invalidTabs.length > 0) {
        const listHtml = CommonUtils.generateHtmlList(
          this.lang.map.msg_following_tabs_valid,
          invalidTabs
        );
        this.dialogService.error(listHtml.outerHTML);
        return false;
      }
      return true;
    }
  }

  _destroyComponent(): void {
  }

  _getNewInstance(): OrganizationsEntitiesSupport {
    return new OrganizationsEntitiesSupport().clone();
  }

  _launchFail(error: any): void {
    console.log('problem in launch');
  }

  _prepareModel():
    | Observable<OrganizationsEntitiesSupport>
    | OrganizationsEntitiesSupport {
    return new OrganizationsEntitiesSupport().clone({
      ...this.model,
      ...this.basicInfoTab.getRawValue(),
      ...this.beneficiaryGroup.getRawValue(),
      ...this.organizationOfficerGroup.getRawValue(),
      description: this.specialExplanationsField.value,
    });
  }

  _setDefaultValues(): void {
    this.requestTypeField.setValue(ServiceRequestTypes.NEW);
  }

  _resetForm(): void {
    this.form.reset();
    this.model = this._getNewInstance();
    this.operation = this.operationTypes.CREATE;
    this.setSelectedLicense(undefined, true);
    this._setDefaultValues();
  }

  _saveFail(error: any): void {
    console.log('problem in save');
  }

  _updateForm(model: OrganizationsEntitiesSupport | undefined): void {
    this.model = model;
    if (!model) {
      this.cd.detectChanges();
      return;
    }
    // patch the form here
    this.form.patchValue({
      basicInfo: model.getBasicInfoFields(),
      beneficiary: model.getBeneficiariesTypeFields(),
      organizationOfficer: model.getOrganizationOfficerFields(),
      description: model.description,
    });

    this.cd.detectChanges();
  }

  private _getInvalidTabs(): any {
    let failedList: string[] = [];
    for (const key in this.tabsData) {
      if (!this.tabsData[key].validStatus()) {
        // @ts-ignore
        failedList.push(this.lang.map[this.tabsData[key].langKey]);
      }
    }
    return failedList;
  }

  private _updateModelAfterSave(model: OrganizationsEntitiesSupport): void {
    if (
      (this.openFrom === OpenFrom.USER_INBOX ||
        this.openFrom === OpenFrom.TEAM_INBOX) &&
      this.model?.taskDetails &&
      this.model.taskDetails.tkiid
    ) {
      this.service.getTask(this.model.taskDetails.tkiid).subscribe((model) => {
        this.model = model;
      });
    } else {
      this.model = model;
    }
  }

  private _listenToServiceType() {
    this.serviceType.valueChanges.pipe(
      takeUntil(this.destroy$),
      map((id) => this.serviceTypes.find((x) => x.id === id)),
      tap(_ => {
        this.otherService.reset();
      }),
      tap((serviceType) => {
        if (serviceType) {
          if (this._isOthersServiceType(serviceType)) {
            this.showOtherService = true;
            this.otherService.addValidators([CustomValidators.required]);
            return;
          }
        }
        this.otherService.removeValidators([CustomValidators.required]);
        this.showOtherService = false;
      }),
      tap(_ => {
        this.otherService.updateValueAndValidity();
      })
    ).subscribe();
  }

  get isNotCreateOeration() {
    return this.operation != this.operationTypes.CREATE;
  }

  private _isOthersServiceType(serviceType?: AdminLookup) {
    if (!serviceType) return false;
    return serviceType.enName.toLocaleLowerCase() === 'other' ||
      serviceType.enName.toLocaleLowerCase() === 'others'
  }

  private _loadJobTitles(): void {
    this.jobTitleService
      .loadAsLookups()
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          return of([]);
        })
      )
      .pipe(map(res => res.filter(jobTitle => jobTitle.isActive())))
      .subscribe((result) => (this.jobTitleList = result));
  }

  private _loadActivityTypes() {
    this.adminLookupService
      .loadAsLookups(AdminLookupTypeEnum.SERVICE_TYPE)
      .subscribe((list) => {
        this.serviceTypes = list;
        const id = this.serviceType.value;
        const serviceType = this.serviceTypes.find((x) => x.id === id)
        this.showOtherService = this._isOthersServiceType(serviceType);
      });
  }

  validateApproveTimplate() {
    return of(null).pipe(
      switchMap(() => {
        return this.customServiceTemplate.loadTemplatesByCaseId(this.model!.getCaseType(), this.model?.getCaseId())
      }),
      map(temps => {
        return !!temps.length && temps[0].approvalTemplateType == ApprovalTemplateTypeEnum.approve
      })
    )
  }
  validateRejectTimplate() {
    return of(null).pipe(
      switchMap(() => {
        return this.customServiceTemplate.loadTemplatesByCaseId(this.model!.getCaseType(), this.model?.getCaseId())
      }),
      map(temps => {
        return !!temps.length && temps[0].approvalTemplateType == ApprovalTemplateTypeEnum.reject
      })
    )
  }
  private _loadExternalUsers() {
    this.externalUserService
      .getByProfileCriteria({
        'profile-id': this.employeeService.getProfile()?.id!,
      })
      .pipe(
        takeUntil(this.destroy$),
        map((records) => {
          this.externalUsersList = records;
        }),
        tap((_) =>
          this.externalUsersList.sort((a, b) =>
            a.getName() < b.getName() ? -1 : 1
          )
        )
      )
      .subscribe();
  }

  onTabChange($event: TabComponent) {
    this.loadAttachments = $event.name === this.tabsData.attachments.name;
  }

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
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
      isAllowed =
        caseStatus !== CommonCaseStatus.CANCELLED &&
        caseStatus !== CommonCaseStatus.FINAL_APPROVE &&
        caseStatus !== CommonCaseStatus.FINAL_REJECTION;
    }
    return !isAllowed;
  }

  handleReadonly(): void {
    // if record is new, no readonly (don't change as default is readonly = false)
    if (!this.model?.id) {
      return;
    }

    let caseStatus = this.model.getCaseStatus();
    if (caseStatus == CommonCaseStatus.FINAL_APPROVE || caseStatus === CommonCaseStatus.FINAL_REJECTION) {
      this.readonly = true;
      return;
    }

    if (this.openFrom === OpenFrom.USER_INBOX) {
      if (this.employeeService.isExternalUser() && this.model.isReturned()) {
        this.readonly = false;
      }

    } else if (this.openFrom === OpenFrom.TEAM_INBOX) {
      // after claim, consider it same as user inbox and use same condition
      if (this.model.taskDetails.isClaimed()) {
        if (this.employeeService.isExternalUser() && this.model.isReturned()) {
          this.readonly = false;
        }

      }
    } else if (this.openFrom === OpenFrom.SEARCH) {
      // if saved as draft and opened by creator who is charity user, then no readonly
      if (this.model?.canCommit()) {
        this.readonly = false;
      }
   
    }
  }

  selectTemplatePopup(isUploaded: boolean) {
    if (!this.model) {
      return;
    }
    if (isUploaded) {
      this.customServiceTemplate.loadActiveTemplatesByCaseType(this.model?.getCaseType()).subscribe((data) => {
        this.dialogService.show(SelectCustomServiceTemplatePopupComponent, {
          list: data,
          showSelectBtn: true,
          showDelete:false
        }).onAfterClose$.subscribe((temp) => {
          if (temp) {
            this.selectedTemplate = temp;
          }
        })
      })
    } else {
      this.customServiceTemplate.loadTemplatesByCaseId(this.model?.getCaseType(), this.model?.getCaseId()).subscribe((data) => {
        this.dialogService.show(SelectCustomServiceTemplatePopupComponent, {list: data, showSelectBtn: false, showDelete:this.isLicensingUser && this.openFrom === this.openFromEnum.USER_INBOX})
      })
    }
  }

  uploadTemplate(file: File | File[] | undefined) {
    if (!this.model) {
      return;
    }
    if (file) {
      let uploadedTemplate;
      if (!file || file instanceof File) {
        uploadedTemplate = file;
      } else {
        uploadedTemplate = file[0];
      }
      this.customServiceTemplate.uploadCaseDoc(this.model.getCaseType(), this.model.getCaseId(), {
        documentDTO: {
          arabicName: this.selectedTemplate.arabicName,
          englishName: this.selectedTemplate.englishName,
          approvalTemplateType: this.selectedTemplate.approvalTemplateType,
        }
      }, uploadedTemplate).subscribe((result) => {
        if (!result) {
          return;
        }
        this.dialogService.success(this.lang.map.file_have_been_uploaded_successfully);
      })
    }
  }

  get isLicensingUser() {
    return this.employeeService.isLicensingUser();
  }

  get isInternalUser() {
    return this.employeeService.isInternalUser();
  }

  isEditRequestTypeAllowed(): boolean {
    return !this.model?.id || (!!this.model?.id && this.model.canCommit());
  }

  isEditLicenseAllowed(): boolean {
    let isAllowed =
      !this.model?.id || (!!this.model?.id && this.model.canCommit());
    return (
      isAllowed &&
      CommonUtils.isValidValue(this.requestTypeField.value) &&
      this.requestTypeField.value !== ServiceRequestTypes.NEW
    );
  }

  loadLicensesByCriteria(
    criteria: Partial<OrganizationsEntitiesSupportSearchCriteria>
  ): Observable<OrganizationsEntitiesSupport[]> {
    return this.service.licenseSearch(criteria);
  }

  setSelectedLicense(
    licenseDetails: OrganizationsEntitiesSupport | undefined,
    ignoreUpdateForm: boolean
  ) {
    this.selectedLicense = licenseDetails;
    // update form fields if i have license
    if (licenseDetails && !ignoreUpdateForm) {
      let value: any = new OrganizationsEntitiesSupport().clone({
        ...licenseDetails,
      });
      value.requestType = this.requestTypeField.value;
      value.oldLicenseFullSerial = licenseDetails.fullSerial;
      value.oldLicenseId = licenseDetails.id;
      value.oldLicenseSerial = licenseDetails.serial;
      value.documentTitle = '';
      value.fullSerial = null;
      value.description = '';
      value.createdOn = '';
      value.classDescription = '';

      // delete id because license details contains old license id, and we are adding new, so no id is needed
      delete value.id;
      delete value.vsId;
      delete value.serial;

      this._updateForm(value);
    }
  }

  selectOrganizationOfficer(externalUserId: number) {
    const selectedOfficer = this.externalUsersList.find(
      (x) => x.id === externalUserId
    );
    this.organizationOfficerGroup.patchValue({
      ...selectedOfficer,
      phone: selectedOfficer?.phoneNumber,
      mobileNo: selectedOfficer?.phoneExtension,
      jobTitle: this.jobTitleList
        .find((x) => x.id === selectedOfficer!.jobTitle)
        ?.getName() || selectedOfficer!.jobTitleName,
    });
  }

  get basicInfoTab(): UntypedFormGroup {
    return this.form.get('basicInfo') as UntypedFormGroup;
  }

  get requestTypeField(): UntypedFormControl {
    return this.basicInfoTab.get('requestType') as UntypedFormControl;
  }

  get serviceType(): UntypedFormControl {
    return this.basicInfoTab.get('serviceType') as UntypedFormControl;
  }

  get otherService(): UntypedFormControl {
    return this.basicInfoTab.get('otherService') as UntypedFormControl;
  }

  get organizationId(): UntypedFormControl {
    return this.basicInfoTab.get('organizationId') as UntypedFormControl;
  }

  get oldLicenseFullSerialField(): UntypedFormControl {
    return this.basicInfoTab.get('oldLicenseFullSerial') as UntypedFormControl;
  }

  get beneficiaryGroup(): UntypedFormGroup {
    return this.form.get('beneficiary') as UntypedFormGroup;
  }

  get organizationOfficerGroup(): UntypedFormGroup {
    return this.form.get('organizationOfficer') as UntypedFormGroup;
  }

  get specialExplanationsField(): UntypedFormControl {
    return this.form.get('description') as UntypedFormControl;
  }
}
