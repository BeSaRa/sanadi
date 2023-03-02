import { JobTitleService } from '@services/job-title.service';
import { ExternalUser } from '@app/models/external-user';
import { ExternalUserService } from '@services/external-user.service';
import { AdminLookupService } from '@services/admin-lookup.service';
import { ChangeDetectorRef, Component } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';
import { AdminLookupTypeEnum } from '@app/enums/admin-lookup-type-enum';
import { CommonCaseStatus } from '@app/enums/common-case-status.enum';
import { OpenFrom } from '@app/enums/open-from.enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { SaveTypes } from '@app/enums/save-types';
import { ServiceRequestTypes } from '@app/enums/service-request-types';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { AdminLookup } from '@app/models/admin-lookup';
import { Lookup } from '@app/models/lookup';
import { OrganizationsEntitiesSupport } from '@app/models/organizations-entities-support';
import { OrganizationsEntitiesSupportSearchCriteria } from '@app/models/organizations-entities-support-search-criteria';
import { DialogService } from '@app/services/dialog.service';
import { EmployeeService } from '@app/services/employee.service';
import { LangService } from '@app/services/lang.service';
import { LicenseService } from '@app/services/license.service';
import { LookupService } from '@app/services/lookup.service';
import { OrganizationsEntitiesSupportService } from '@app/services/organizations-entities-support.service';
import { ToastService } from '@app/services/toast.service';
import { TabComponent } from '@app/shared/components/tab/tab.component';
import { TabMap } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { Observable, of, Subject } from 'rxjs';
import {
  catchError,
  exhaustMap,
  filter,
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { JobTitle } from '@app/models/job-title';

@Component({
  selector: 'app-organizations-entities-support',
  templateUrl: './organizations-entities-support.component.html',
  styleUrls: ['./organizations-entities-support.component.scss'],
})
export class OrganizationsEntitiesSupportComponent extends EServicesGenericComponent<
OrganizationsEntitiesSupport,
OrganizationsEntitiesSupportService
> {
  constructor(
    public lang: LangService,
    private cd: ChangeDetectorRef,
    private toastService: ToastService,
    private dialogService: DialogService,
    public fb: UntypedFormBuilder,
    public service: OrganizationsEntitiesSupportService,
    private lookupService: LookupService,
    public employeeService: EmployeeService,
    private licenseService: LicenseService,
    private adminLookupService: AdminLookupService,
    private externalUserService: ExternalUserService,
    private jobTitleService: JobTitleService
  ) {
    super();
  }

  form!: UntypedFormGroup;
  loadAttachments: boolean = false;
  requestTypesList: Lookup[] = this.lookupService.listByCategory.RequestTypeNewOnly;
  serviceTypes: AdminLookup[] = [];
  licenseSearch$: Subject<string> = new Subject<string>();
  externalUsersList: ExternalUser[] = [];
  jobTitleList: JobTitle[] = [];
  selectedLicense?: OrganizationsEntitiesSupport;
  showOtherService: boolean = false;
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
      validStatus: () => this.basicInfoTab && this.basicInfoTab.valid,
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

  _destroyComponent(): void { }

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
    if (
      caseStatus == CommonCaseStatus.FINAL_APPROVE ||
      caseStatus === CommonCaseStatus.FINAL_REJECTION
    ) {
      this.readonly = true;
      return;
    }

    if (this.openFrom === OpenFrom.USER_INBOX) {
      if (this.employeeService.isCharityManager()) {
        this.readonly = false;
      } else if (this.employeeService.isCharityUser()) {
        this.readonly = !this.model.isReturned();
      }
    } else if (this.openFrom === OpenFrom.TEAM_INBOX) {
      // after claim, consider it same as user inbox and use same condition
      if (this.model.taskDetails.isClaimed()) {
        if (this.employeeService.isCharityManager()) {
          this.readonly = false;
        } else if (this.employeeService.isCharityUser()) {
          this.readonly = !this.model.isReturned();
        }
      }
    } else if (this.openFrom === OpenFrom.SEARCH) {
      // if saved as draft, then no readonly
      if (this.model?.canCommit()) {
        this.readonly = false;
      }
    }
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
        ?.getName(),
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
