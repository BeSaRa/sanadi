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

@Component({
  selector: 'app-urgent-intervention-financial-notification',
  templateUrl: './urgent-intervention-financial-notification.component.html',
  styleUrls: ['./urgent-intervention-financial-notification.component.scss']
})
export class UrgentInterventionFinancialNotificationComponent extends EServicesGenericComponent<UrgentInterventionFinancialNotification, UrgentInterventionFinancialNotificationService> {
  requestTypesList: Lookup[] = this.lookupService.listByCategory.UrgentInterventionFinancialRequestType
  receiverTypes: Lookup[] = this.lookupService.listByCategory.ReceiverType
  interventionAreasTabStatus: ReadinessStatus = 'READY';
  interventionFieldsTabStatus: ReadinessStatus = 'READY';
  @ViewChild('interventionRegionListComponent') interventionRegionListComponentRef!: InterventionRegionListComponent;
  @ViewChild('interventionFieldListComponent') interventionFieldListComponentRef!: InterventionFieldListComponent;
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
      validStatus: () => this.basicInfoTab.valid && !!this.model?.oldLicenseId
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
    private licenseService: LicenseService,
    private cd: ChangeDetectorRef,
    public fb: FormBuilder
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
      transferData: this.fb.group({})
    })
  }
  _afterBuildForm(): void {
  }
  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    throw new Error('Method not implemented.');
  }
  _beforeLaunch(): boolean | Observable<boolean> {
    throw new Error('Method not implemented.');
  }
  _afterLaunch(): void {
    throw new Error('Method not implemented.');
  }
  _prepareModel(): UrgentInterventionFinancialNotification | Observable<UrgentInterventionFinancialNotification> {
    let value = (new UrgentInterventionFinancialNotification()).clone({
      ...this.model,
      ...this.form.getRawValue(),
      interventionFieldList: this.interventionFieldListComponentRef.list,
      interventionRegionList: this.interventionRegionListComponentRef.list,
    });
    return value;
  }
  _afterSave(model: UrgentInterventionFinancialNotification, saveType: SaveTypes, operation: OperationTypes): void {
    throw new Error('Method not implemented.');
  }
  _saveFail(error: any): void {
    throw new Error('Method not implemented.');
  }
  _launchFail(error: any): void {
    throw new Error('Method not implemented.');
  }
  _destroyComponent(): void {
  }
  _updateForm(model: UrgentInterventionFinancialNotification | undefined): void {
    console.log(model)
    this.model = model;
    // patch the form here
    if (!model) {
      this.cd.detectChanges();
      return;
    }

    this.form.patchValue(model.buildForm());
    this.cd.detectChanges();
    console.log(this.form)
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
    console.log(licenseDetails)
    this.selectedLicense = licenseDetails;
    // update form fields if i have license
    if (licenseDetails && !ignoreUpdateForm) {
      let value: any = (new UrgentInterventionFinancialNotification()).clone(licenseDetails);
      value.caseType = CaseTypes.URGENT_INTERVENTION_FINANCIAL_NOTIFICATION
      value.oldLicenseFullSerial = licenseDetails.fullSerial;
      value.oldLicenseId = licenseDetails.id;
      value.oldLicenseSerial = licenseDetails.serial;
      value.fullSerial = null;
      // delete id because license details contains old license id, and we are adding new, so no id is needed
      delete value.id;
      delete value.vsId;

      this._updateForm(value);
    }
  }

  private singleLicenseDetails(license: UrgentInterventionReportResult): Observable<UrgentInterventionReport> {
    return this.licenseService._loadUrgentInterventionAnnouncementByLicenseId(license.id) as Observable<UrgentInterventionReport>;
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
  get isTransfer() {
    return this.requestTypeField.value == UrgentInterventionFinancialRequestType.Transfer
  }
  get isReceive() {
    return this.requestTypeField.value == UrgentInterventionFinancialRequestType.Receive
  }

  _resetForm(): void {
  }
}
