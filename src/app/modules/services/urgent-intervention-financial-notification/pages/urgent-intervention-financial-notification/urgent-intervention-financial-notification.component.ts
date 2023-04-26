import { AdminResult } from '@models/admin-result';
import { ImplementingAgency } from '@models/implementing-agency';
import { UserClickOn } from '@enums/user-click-on.enum';
import { CustomValidators } from '@app/validators/custom-validators';
import { UrgentInterventionAnnouncementSearchCriteria } from '@models/urgent-intervention-announcement-search-criteria';
import { UrgentInterventionAnnouncementService } from '@services/urgent-intervention-announcement.service';
import { UrgentInterventionAnnouncementResult } from '@models/urgent-intervention-announcement-result';
import { UrgentFinancialNotificationAccountType } from '@enums/urgent-financial-notification-account-type.enum';
import { catchError, exhaustMap, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import {
  InterventionImplementingAgencyListComponent
} from '@modules/services/shared-services/components/intervention-implementing-agency-list/intervention-implementing-agency-list.component';
import { ToastService } from '@services/toast.service';
import { BankAccount } from '@models/bank-account';
import { CommonService } from '@services/common.service';
import { UrgentInterventionFinancialRequestType } from '@enums/service-request-types';
import { OpenFrom } from '@enums/open-from.enum';
import { CommonCaseStatus } from '@enums/common-case-status.enum';
import { TabComponent } from '@app/shared/components/tab/tab.component';
import {
  InterventionFieldListComponent
} from '@modules/services/shared-services/components/intervention-field-list/intervention-field-list.component';
import {
  InterventionRegionListComponent
} from '@modules/services/shared-services/components/intervention-region-list/intervention-region-list.component';
import { LicenseService } from '@services/license.service';
import { DialogService } from '@services/dialog.service';
import { ReadinessStatus, TabMap } from '@app/types/types';
import { Lookup } from '@models/lookup';
import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { OperationTypes } from '@enums/operation-types.enum';
import { SaveTypes } from '@enums/save-types';
import { LangService } from '@services/lang.service';
import { Observable, of, Subject } from 'rxjs';
import { UrgentInterventionFinancialNotification } from '@models/urgent-intervention-financial-notification';
import {
  UrgentInterventionFinancialNotificationService
} from '@services/urgent-intervention-financial-notification.service';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { LookupService } from '@services/lookup.service';
import { ImplementingAgencyTypes } from '@enums/implementing-agency-types.enum';
import { CommonUtils } from '@helpers/common-utils';
import { UrgentInterventionAnnouncement } from '@models/urgent-intervention-announcement';
import { EmployeeService } from '@app/services/employee.service';

@Component({
  selector: 'app-urgent-intervention-financial-notification',
  templateUrl: './urgent-intervention-financial-notification.component.html',
  styleUrls: ['./urgent-intervention-financial-notification.component.scss']
})
export class UrgentInterventionFinancialNotificationComponent extends EServicesGenericComponent<UrgentInterventionFinancialNotification, UrgentInterventionFinancialNotificationService> implements AfterViewInit {
  requestTypesList: Lookup[] = this.lookupService.listByCategory.UrgentInterventionFinancialRequestType;
  implementingAgencyType: Lookup[] = this.lookupService.listByCategory.ImplementingAgencyType;
  urgentFinancialNotificationAccountType: Lookup[] = this.lookupService.listByCategory.UrgentFinancialNotificationAccountType;

  accountsTypesList: any[] = [];
  entitiesTabStatus: ReadinessStatus = 'READY';
  interventionAreasTabStatus: ReadinessStatus = 'READY';
  interventionFieldsTabStatus: ReadinessStatus = 'READY';
  implementingAgencies: ImplementingAgency[] = [];
  implementingAgenciesAdminRes: AdminResult[] = [];
  bankAccountList: BankAccount[] = [];
  @ViewChild('interventionRegionListComponent') interventionRegionListComponentRef!: InterventionRegionListComponent;
  @ViewChild('interventionFieldListComponent') interventionFieldListComponentRef!: InterventionFieldListComponent;
  @ViewChild('implementingAgencyListComponent') implementingAgencyListComponentRef!: InterventionImplementingAgencyListComponent;
  licenseSearch$: Subject<string> = new Subject<string>();
  selectedLicense?: UrgentInterventionAnnouncement;
  loadAttachments: boolean = false;
  OperationTypes = OperationTypes;
  form!: UntypedFormGroup;
  tabsData: TabMap = {
    basicInfo: {
      name: 'basicInfoTab',
      langKey: 'lbl_basic_info',
      index: 0,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => this.basicInfoTab.valid
    },
    entities: {
      name: 'entitiesTab',
      langKey: 'entities',
      index: 1,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => true,
      show: () => true,
      validStatus: () => {
        return !this.implementingAgencyListComponentRef || (this.entitiesTabStatus === 'READY' && this.implementingAgencyListComponentRef.list.length > 0);
      }
    },
    interventionAreas: {
      name: 'interventionAreasTab',
      langKey: 'intervention_areas',
      index: 2,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => {
        return !this.interventionRegionListComponentRef || (this.interventionAreasTabStatus === 'READY' && this.interventionRegionListComponentRef.list.length > 0);
      }
    },
    interventionFields: {
      name: 'interventionFieldsTab',
      langKey: 'intervention_fields',
      index: 3,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => {
        return !this.interventionFieldListComponentRef || (this.interventionFieldsTabStatus === 'READY' && this.interventionFieldListComponentRef.list.length > 0);
      }
    },
    transferData: {
      name: 'transferDataTab',
      langKey: 'transfer_data',
      index: 10,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => this.transferDataTab.valid
    },
    attachments: {
      name: 'attachmentsTab',
      langKey: 'attachments',
      index: 10,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => true
    }
  };
  formProperties = {
    requestType: () => {
      return this.getObservableField('requestTypeField', 'requestType');
    }
  }

  constructor(
    private lookupService: LookupService,
    public urgentInterventionAnnouncementService: UrgentInterventionAnnouncementService,
    public service: UrgentInterventionFinancialNotificationService,
    public lang: LangService,
    private dialogService: DialogService,
    private toastService: ToastService,
    private licenseService: LicenseService,
    private cd: ChangeDetectorRef,
    private employeeService: EmployeeService,
    public fb: UntypedFormBuilder,
    private commonService: CommonService
  ) {
    super();
  }

  ngAfterViewInit(): void {
    this.cd.detectChanges();
  }

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }

  onTabChange($event: TabComponent) {
    this.loadAttachments = $event.name === this.tabsData.attachments.name;
  }

  _getNewInstance(): UrgentInterventionFinancialNotification {
    return new UrgentInterventionFinancialNotification().clone();
  }

  _initComponent(): void {
    this.listenToLicenseSearch();
  }

  _buildForm(): void {
    let urgentInterventionFinancialNotification = this._getNewInstance();
    this.form = this.fb.group({
      basicInfo: this.fb.group(urgentInterventionFinancialNotification.buildForm(true)),
      transferData: this.fb.group(urgentInterventionFinancialNotification.buildTransferDataForm(true))
    });
    this.setLicenseValidations()
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
  _afterBuildForm(): void {
    this.cd.detectChanges();
    this.handleReadonly();
    if (this.fromDialog) {
      this.loadSelectedLicenseById(this.model!.oldLicenseId, () => {
        this.urgentAnnouncementFullSerialField.updateValueAndValidity();
      });
    }
  }

  private loadSelectedLicenseById(id: string, callback?: any): void {
    if (!id) {
      return;
    }
    this.licenseService.loadUrgentInterventionAnnouncementByLicenseId(id)
      .pipe(
        filter(license => !!license),
        takeUntil(this.destroy$)
      )
      .subscribe((license) => {
        this.setSelectedLicense(license, true);

        callback && callback();
      });
  }
  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (!this.selectedLicense) {
      this.dialogService.error(this.lang.map.please_select_license_to_complete_save);
      return false;
    } else {
      if (saveType === SaveTypes.DRAFT) {
        return true;
      }
      const invalidTabs = this._getInvalidTabs();
      if (invalidTabs.length > 0) {
        const listHtml = CommonUtils.generateHtmlList(this.lang.map.msg_following_tabs_valid, invalidTabs);
        this.dialogService.error(listHtml.outerHTML);
        return false;
      }
      return true;
    }
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    return !!this.model && this.form.valid && this.model.canStart();
  }

  _afterLaunch(): void {
    this.resetForm$.next();
    this.toastService.success(this.lang.map.request_has_been_sent_successfully);
  }

  _prepareModel(): UrgentInterventionFinancialNotification | Observable<UrgentInterventionFinancialNotification> {
    return new UrgentInterventionFinancialNotification().clone({
      ...this.model,
      ...this.basicInfoTab.getRawValue(),
      ...this.transferDataTab.getRawValue(),
      interventionFieldList: this.interventionFieldListComponentRef.list,
      interventionRegionList: this.interventionRegionListComponentRef.list,
      implementingAgencyList: this.implementingAgencyListComponentRef.list
    });
  }

  private _updateModelAfterSave(model: UrgentInterventionFinancialNotification): void {
    if ((this.openFrom === OpenFrom.USER_INBOX || this.openFrom === OpenFrom.TEAM_INBOX) && this.model?.taskDetails && this.model.taskDetails.tkiid) {
      this.service.getTask(this.model.taskDetails.tkiid)
        .subscribe((model) => {
          this.model = model;
        });
    } else {
      this.model = model;
    }
  }

  _afterSave(model: UrgentInterventionFinancialNotification, saveType: SaveTypes, operation: OperationTypes): void {
    this._updateModelAfterSave(model);
    if (
      (operation === OperationTypes.CREATE && saveType === SaveTypes.FINAL) ||
      (operation === OperationTypes.UPDATE && saveType === SaveTypes.COMMIT)
    ) {
      this.dialogService.success(this.lang.map.msg_request_has_been_added_successfully.change({ serial: model.fullSerial }));
    } else {
      this.toastService.success(this.lang.map.request_has_been_saved_successfully);
    }
  }

  _saveFail(error: any): void {
    console.log('problem in save');
  }

  _launchFail(error: any): void {
    console.log('problem in launch');
  }

  _destroyComponent(): void {
  }

  _updateForm(model: UrgentInterventionFinancialNotification | undefined): void {
    this.model = model;
    if (!model) {
      this.cd.detectChanges();
      return;
    }
    this.basicInfoTab.patchValue(model.buildForm());
    this.transferDataTab.patchValue(model.buildTransferDataForm());
    if (this.implementingAgencyTypeField.value) {
      this._loadImplementingAgenciesByAgencyType();
      this._loadImplementingAgenciesAccounts();
    }
    if (this.accountType.value && !this.boxAccountType) {
      this._loadImplementingAgenciesAccounts();
    }

    this.cd.detectChanges();
    this.handleRequestTypeChange(model.requestType, false);
  }

  licenseSearch($event?: Event): void {
    $event?.preventDefault();
    const value = this.urgentAnnouncementFullSerialField.value && this.urgentAnnouncementFullSerialField.value.trim();
    this.licenseSearch$.next(value);
  }

  private listenToLicenseSearch() {
    this.licenseSearch$
      .pipe(
        takeUntil(this.destroy$),
        exhaustMap(urgentAnnouncementFullSerialField => {
          return this.loadLicencesByCriteria({
            fullSerial: urgentAnnouncementFullSerialField,
            licenseStatus: 2
          })
            .pipe(catchError(() => of([])));
        }))
      .pipe(
        // display message in case there is no returned license
        tap(list => !list.length ? this.dialogService.info(this.lang.map.no_result_for_your_search_criteria) : null),
        // allow only the collection if it has value
        filter(result => !!result.length),
        exhaustMap((licenses) => {
          return licenses.length === 1 ? this.singleLicenseDetails(licenses[0]) : this.openSelectLicense(licenses);
        }),
        filter((info): info is UrgentInterventionAnnouncement => !!info),
      )
      .subscribe((selection) => {
        this.setSelectedLicense(selection, false);
      });
  }

  getInterventionLicense() {
    this.licenseService.loadUrgentInterventionInterventionLicense().subscribe(({ rs }) => {
      this.accountNumberField.setValue(rs.accountNumber);
    });
  }

  private setSelectedLicense(licenseDetails: UrgentInterventionAnnouncement | undefined, ignoreUpdateForm: boolean) {
    this.selectedLicense = licenseDetails;
    // update form fields if i have license
    if (licenseDetails && !ignoreUpdateForm) {
      let value: any = new UrgentInterventionFinancialNotification();
      value.requestType = this.requestTypeField.value;
      value.oldLicenseFullSerial = licenseDetails.fullSerial;
      value.oldLicenseId = licenseDetails.id;
      value.urgentAnnouncementFullSerial = licenseDetails.fullSerial;
      value.interventionFieldList = licenseDetails.interventionFieldList;
      value.interventionRegionList = licenseDetails.interventionRegionList;
      value.implementingAgencyList = licenseDetails.implementingAgencyList;
      value.interventionName = licenseDetails.interventionName;
      value.projectDescription = licenseDetails.projectDescription;
      value.beneficiaryCountry = licenseDetails.beneficiaryCountry;
      value.beneficiaryRegion = licenseDetails.beneficiaryRegion;
      value.executionCountry = licenseDetails.executionCountry;
      value.executionRegion = licenseDetails.executionRegion;
      value.description = licenseDetails.description;
      value.beneficiaryCountryInfo = licenseDetails.beneficiaryCountryInfo;
      value.executionCountryInfo = licenseDetails.executionCountryInfo;
      value.licenseVSID = licenseDetails.vsId;
      this._updateForm(value);
      this.handleFinanecDataFillList();
    }
  }
  resetLicence() {
    this.setSelectedLicense(new UrgentInterventionAnnouncement().clone({
      description: '',
      projectDescription: '',
      interventionName: '',
      beneficiaryRegion: '',
      executionRegion: ''
    }), false)
  }
  private singleLicenseDetails(license: UrgentInterventionAnnouncementResult): Observable<UrgentInterventionAnnouncement> {
    return this.licenseService.loadUrgentInterventionAnnouncementByLicenseId(license.id) as Observable<UrgentInterventionAnnouncement>;
  }

  private openSelectLicense(licenses: UrgentInterventionAnnouncementResult[]): Observable<undefined | UrgentInterventionAnnouncementResult> {
    return this.licenseService.openSelectLicenseDialog(licenses, this.model?.clone({ requestType: this.requestTypeField.value || null }), true, this.service.selectLicenseDisplayColumns)
      .onAfterClose$
      .pipe(map((result: ({ selected: UrgentInterventionAnnouncementResult, details: UrgentInterventionAnnouncementResult } | undefined)) => result ? result.details : result));
  }

  loadLicencesByCriteria(criteria: Partial<UrgentInterventionAnnouncementSearchCriteria>): Observable<UrgentInterventionAnnouncementResult[]> {
    return this.service.licenseSearch(criteria);
  }

  isEditAllowed(): boolean {
    return !this.model?.id || (!!this.model?.id && this.model.canCommit());
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

  handleRequestTypeChange(requestTypeValue: number, userInteraction: boolean = false) {
    of(userInteraction).pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.confirmChangeRequestType(userInteraction))
    ).subscribe((clickOn: UserClickOn) => {
      if (clickOn === UserClickOn.YES) {
        if (userInteraction) {
          this.accountType.setValidators([]);
          this.accountType.reset();
          this.resetAccountNumber();
          this.handleFinanecDataFillList()
        }
        this.requestType$.next(requestTypeValue);
      } else {
        this.requestTypeField.setValue(this.requestType$.value);
      }
    });
  }
  handleFinanecDataFillList() {
    if (this.isReceive) {
      this.implementingAgencyTypeField.setValue(ImplementingAgencyTypes.ExternalOffice);
      this.handleImplementingAgencyTypeChanges();
      this.accountType.setValidators([Validators.required]);
    } else {
      this.implementingAgencyTypeField.setValue(null);
      this.handleImplementingAgencyTypeChanges();
    }
  }
  private setLicenseValidations(): void {
    this.urgentAnnouncementFullSerialField.setValidators([CustomValidators.required, (control) => {
      return this.selectedLicense && this.selectedLicense?.fullSerial === control.value ? null : { select_license: true };
    }]);
    this.urgentAnnouncementFullSerialField.updateValueAndValidity();
  }
  _handleChangeAccountType() {
    if (this.implementingAgencyField.value)
      if (this.boxAccountType) {
        this.getInterventionLicense();
      } else {
        this.resetAccountNumber();
      }
  }

  resetAccountNumber() {
    this.accountNumberField.reset();
  }

  handleImplementingAgencyTypeChanges() {
    this._loadImplementingAgenciesByAgencyType();
    this.implementingAgencyField.setValue(null);
    this.accountNumberField.setValue(null);
  }

  private _loadImplementingAgenciesByAgencyType() {
    if (this.isReceive) {
      this.commonService.loadAgenciesByAgencyTypeAndCountry(this.implementingAgencyTypeField.value, this.model?.executionCountry || 0)
        .subscribe((result) => {
          this.implementingAgenciesAdminRes = [...result];
        });
    } else {
      this.implementingAgencies = (this.model?.implementingAgencyList || []).filter(ia => ia.implementingAgencyType == this.implementingAgencyTypeField.value)
    }
  }
  handleImplementingAgencyNameChanges() {
    this._loadImplementingAgenciesAccounts();
    this.accountNumberField.setValue(null);
    this._handleChangeAccountType();
  }

  private _loadImplementingAgenciesAccounts() {
    if (this.implementingAgencyField.value)
      if (this.implementingAgencyTypeField.value == ImplementingAgencyTypes.Partner) {
        this.licenseService.loadPartnerLicenseByLicenseId(this.implementingAgencyField.value).subscribe(data => {
          this.bankAccountList = [...data.bankAccountList];
        });
      } else {
        this.licenseService.loadFinalLicenseByLicenseId(this.implementingAgencyField.value).subscribe(data => {
          this.bankAccountList = [...data.bankAccountList];
        });
      }
    else {
      this.bankAccountList = [];
    }
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

  get boxAccountType() {
    return this.accountType.value == UrgentFinancialNotificationAccountType.CHARITY_ACCOUNT;
  }

  get accountType() {
    return this.transferDataTab.get('accountType') as UntypedFormControl;
  }

  get basicInfoTab(): UntypedFormGroup {
    return (this.form.get('basicInfo')) as UntypedFormGroup;
  }

  get transferDataTab(): UntypedFormGroup {
    return (this.form.get('transferData')) as UntypedFormGroup;
  }

  get requestTypeField() {
    return this.basicInfoTab.get('requestType') as UntypedFormControl;
  }

  get urgentAnnouncementFullSerialField(): UntypedFormControl {
    return this.basicInfoTab.get('urgentAnnouncementFullSerial') as UntypedFormControl;
  }

  get implementingAgencyTypeField(): UntypedFormControl {
    return this.transferDataTab.get('implementingAgencyType') as UntypedFormControl;
  }

  get implementingAgencyField(): UntypedFormControl {
    return this.transferDataTab.get('implementingAgency') as UntypedFormControl;
  }

  get accountNumberField(): UntypedFormControl {
    return this.transferDataTab.get('accountNumber') as UntypedFormControl;
  }

  get isTransfer() {
    return this.requestTypeField.value == UrgentInterventionFinancialRequestType.TRANSFER;
  }

  get isReceive() {
    return this.requestTypeField.value == UrgentInterventionFinancialRequestType.RECEIVE;
  }

  _resetForm(): void {
    this.form.reset();
    this.model = this._getNewInstance();
    this.operation = this.operationTypes.CREATE;
    this.setSelectedLicense(undefined, true);
  }
}
