import { ImplementingAgencyListComponent } from './../../shared/implementing-agency-list/implementing-agency-list.component';
import { ToastService } from '@app/services/toast.service';
import { ServiceRequestTypes } from '@app/enums/service-request-types';
import { BankAccount } from '@app/models/bank-account';
import { AdminResult } from '@app/models/admin-result';
import { CommonService } from '@services/common.service';
import { CaseTypes } from '@app/enums/case-types.enum';
import { UrgentInterventionReport } from '@app/models/urgent-intervention-report';
import { UrgentInterventionReportSearchCriteria } from './../../../../models/urgent-intervention-report-search-criteria';
import { UrgentInterventionFinancialRequestType } from './../../../../enums/urgent-intervention-financial-request-type';
import { OpenFrom } from '@app/enums/open-from.enum';
import { CommonCaseStatus } from '@app/enums/common-case-status.enum';
import { TabComponent } from './../../../../shared/components/tab/tab.component';
import { InterventionFieldListComponent } from './../../shared/intervention-field-list/intervention-field-list.component';
import { InterventionRegionListComponent } from './../../shared/intervention-region-list/intervention-region-list.component';
import { LicenseService } from '@app/services/license.service';
import { UrgentInterventionReportingService } from './../../../../services/urgent-intervention-reporting.service';
import { UrgentInterventionReportResult } from './../../../../models/urgent-intervention-report-result';
import { DialogService } from './../../../../services/dialog.service';
import { tap, filter, exhaustMap, catchError, takeUntil, map } from 'rxjs/operators';
import { TabMap, ReadinessStatus } from './../../../../types/types';
import { Lookup } from '@app/models/lookup';
import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { SaveTypes } from '@app/enums/save-types';
import { LangService } from '@app/services/lang.service';
import { Observable, Subject, of } from 'rxjs';
import { UrgentInterventionFinancialNotification } from '@app/models/urgent-intervention-financial-notification';
import { UrgentInterventionFinancialNotificationService } from './../../../../services/urgent-intervention-financial-notification.service';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { LookupService } from '@app/services/lookup.service';
import { ImplementingAgencyTypes } from '@app/enums/implementing-agency-types.enum';
import { CommonUtils } from '@app/helpers/common-utils';

@Component({
  selector: 'app-urgent-intervention-financial-notification',
  templateUrl: './urgent-intervention-financial-notification.component.html',
  styleUrls: ['./urgent-intervention-financial-notification.component.scss']
})
export class UrgentInterventionFinancialNotificationComponent extends EServicesGenericComponent<UrgentInterventionFinancialNotification, UrgentInterventionFinancialNotificationService> {
  requestTypesList: Lookup[] = this.lookupService.listByCategory.UrgentInterventionFinancialRequestType
  accountsTypesList: any[] = [];
  implementingAgencyType: Lookup[] = this.lookupService.listByCategory.ImplementingAgencyType
  entitiesTabStatus: ReadinessStatus = 'READY';
  interventionAreasTabStatus: ReadinessStatus = 'READY';
  interventionFieldsTabStatus: ReadinessStatus = 'READY';
  implementingAgencies: AdminResult[] = [];
  bankAccountList: BankAccount[] = [];
  @ViewChild('interventionRegionListComponent') interventionRegionListComponentRef!: InterventionRegionListComponent;
  @ViewChild('interventionFieldListComponent') interventionFieldListComponentRef!: InterventionFieldListComponent;
  @ViewChild('implementingAgencyListComponent') implementingAgencyListComponentRef!: ImplementingAgencyListComponent;
  licenseSearch$: Subject<string> = new Subject<string>();
  selectedLicense?: UrgentInterventionReportResult;
  loadAttachments: boolean = false;
  form!: FormGroup;
  tabsData: TabMap = {
    basicInfo: {
      name: 'basicInfoTab',
      langKey: 'lbl_basic_info',
      index: 0,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => this.basicInfoTab.valid && !!this.selectedLicense
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
  constructor(
    private lookupService: LookupService,
    public urgentInterventionReportingService: UrgentInterventionReportingService,
    public service: UrgentInterventionFinancialNotificationService,
    public lang: LangService,
    private dialogService: DialogService,
    private toastService: ToastService,
    private licenseService: LicenseService,
    private cd: ChangeDetectorRef,
    public fb: FormBuilder,
    private commonService: CommonService
  ) {
    super();
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
    })
  }
  _afterBuildForm(): void {
  }
  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (this.requestTypeField.value !== ServiceRequestTypes.NEW && !this.selectedLicense) {
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
    throw new Error('Method not implemented.');
  }
  _afterLaunch(): void {
    throw new Error('Method not implemented.');
  }
  _prepareModel(): UrgentInterventionFinancialNotification | Observable<UrgentInterventionFinancialNotification> {
    return new UrgentInterventionFinancialNotification().clone({
      ...this.model,
      ...this.basicInfoTab.getRawValue(),
      ...this.transferDataTab.getRawValue(),
      interventionFieldList: this.interventionFieldListComponentRef.list,
      interventionRegionList: this.interventionRegionListComponentRef.list,
      implementingAgencyList: this.interventionRegionListComponentRef.list,
    });
  }
  _afterSave(model: UrgentInterventionFinancialNotification, saveType: SaveTypes, operation: OperationTypes): void {
    this.model = model;
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
    console.log('problem in fail');
  }
  _destroyComponent(): void {
  }
  _updateForm(model: UrgentInterventionFinancialNotification | undefined): void {
    this.model = model;
    // patch the form here
    if (!model) {
      this.cd.detectChanges();
      return;
    }

    this.form.patchValue(model.buildForm());
    this.cd.detectChanges();
  }

  licenseSearch($event?: Event): void {
    $event?.preventDefault();
    const value = this.oldLicenseFullSerialField.value && this.oldLicenseFullSerialField.value.trim();
    this.licenseSearch$.next(value);
  }
  private listenToLicenseSearch() {
    this.licenseSearch$
      .pipe(
        takeUntil(this.destroy$),
        exhaustMap(oldLicenseFullSerial => {
          return this.loadLicencesByCriteria({
            fullSerial: oldLicenseFullSerial,
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
        filter((info): info is UrgentInterventionReportResult => !!info),
      )
      .subscribe((selection) => {
        this.setSelectedLicense(selection, false);
      });
  }
  private setSelectedLicense(licenseDetails: UrgentInterventionReportResult | undefined, ignoreUpdateForm: boolean) {
    this.selectedLicense = licenseDetails;
    // update form fields if i have license
    if (licenseDetails && !ignoreUpdateForm) {
      let value: any = new UrgentInterventionFinancialNotification()
      value.oldLicenseFullSerial = licenseDetails.fullSerial;
      value.oldLicenseId = licenseDetails.id;
      value.oldLicenseSerial = licenseDetails.serial;
      value.fullSerial = null;
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
      this._updateForm(value);
    }
  }
  private singleLicenseDetails(license: UrgentInterventionReportResult): Observable<UrgentInterventionReport> {
    return this.licenseService.loadUrgentInterventionAnnouncementByLicenseId(license.id) as Observable<UrgentInterventionReport>;
  }
  private openSelectLicense(licenses: UrgentInterventionReportResult[]): Observable<undefined | UrgentInterventionReportResult> {
    return this.licenseService.openSelectLicenseDialog(licenses, this.model?.clone({ requestType: this.requestTypeField.value || null }), true, this.service.selectLicenseDisplayColumns)
      .onAfterClose$
      .pipe(map((result: ({ selected: UrgentInterventionReportResult, details: UrgentInterventionReportResult } | undefined)) => result ? result.details : result));
  }
  loadLicencesByCriteria(criteria: Partial<UrgentInterventionReportSearchCriteria>): Observable<UrgentInterventionReportResult[]> {
    return this.service.licenseSearch(criteria);
  }

  isEditLicenseAllowed(): boolean {
    // if new or draft record and request type !== new, edit is allowed
    let isAllowed = !this.model?.id || (!!this.model?.id && this.model.canCommit());
    return isAllowed;// && CommonUtils.isValidValue(this.requestTypeField.value) && this.requestTypeField.value !== ServiceRequestTypes.NEW;
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

  _handleRequestTypeChange() {
    if (this.isReceive) {
      this.implementingAgencyTypeField.setValue(2)
      this.handleImplementingAgencyTypeChanges();
    } else {
      this.implementingAgencyTypeField.setValue(null)
      this.handleImplementingAgencyTypeChanges();
    }
  }

  handleImplementingAgencyTypeChanges() {
    this._loadImplementingAgenciesByAgencyType()
    this.implementingAgencyField.setValue(null)
    this.accountNumberField.setValue(null)
  }
  private _loadImplementingAgenciesByAgencyType() {
    this.commonService.loadAgenciesByAgencyTypeAndCountry(this.implementingAgencyTypeField.value, this.model?.executionCountry || 0)
      .subscribe((result) => {
        this.implementingAgencies = [...result]
      });
  }
  handleImplementingAgencyNameChanges() {
    this._loadImplementingAgenciesAccounts()
    this.accountNumberField.setValue(null)
  }
  private _loadImplementingAgenciesAccounts() {
    if (this.implementingAgencyTypeField.value == ImplementingAgencyTypes.Partner) {
      this.licenseService.loadPartnerLicenseByLicenseId(this.implementingAgencyField.value).subscribe(data => {
        this.bankAccountList = [...data.bankAccountList];
      })
    } else {
      this.licenseService.loadFinalLicenseByLicenseId(this.implementingAgencyField.value).subscribe(data => {
        this.bankAccountList = [...data.bankAccountList];
      })
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

  get basicInfoTab(): FormGroup {
    return (this.form.get('basicInfo')) as FormGroup;
  }
  get transferDataTab(): FormGroup {
    return (this.form.get('transferData')) as FormGroup;
  }
  get requestTypeField() {
    return this.basicInfoTab.get('requestType') as FormControl
  }
  get oldLicenseFullSerialField(): FormControl {
    return this.basicInfoTab.get('oldLicenseFullSerial') as FormControl;
  }
  get implementingAgencyTypeField(): FormControl {
    return this.transferDataTab.get('implementingAgencyType') as FormControl;
  }
  get implementingAgencyField(): FormControl {
    return this.transferDataTab.get('implementingAgency') as FormControl;
  }
  get accountNumberField(): FormControl {
    return this.transferDataTab.get('accountNumber') as FormControl;
  }
  get isTransfer() {
    return this.requestTypeField.value == UrgentInterventionFinancialRequestType.Transfer
  }
  get isReceive() {
    return this.requestTypeField.value == UrgentInterventionFinancialRequestType.Receive
  }

  _resetForm(): void {
    this.form.reset();
    this.model = this._getNewInstance();
    this.operation = this.operationTypes.CREATE;
    this.setSelectedLicense(undefined, true);
  }
}
