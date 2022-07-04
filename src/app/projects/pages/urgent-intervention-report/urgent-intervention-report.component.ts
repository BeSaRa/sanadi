import {AfterViewInit, ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {UrgentInterventionReport} from '@app/models/urgent-intervention-report';
import {UrgentInterventionReportingService} from '@app/services/urgent-intervention-reporting.service';
import {LangService} from '@app/services/lang.service';
import {ToastService} from '@app/services/toast.service';
import {DialogService} from '@app/services/dialog.service';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {LookupService} from '@app/services/lookup.service';
import {EmployeeService} from '@app/services/employee.service';
import {LicenseService} from '@app/services/license.service';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {Observable, of, Subject} from 'rxjs';
import {ReadinessStatus, TabMap} from '@app/types/types';
import {SaveTypes} from '@app/enums/save-types';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {Lookup} from '@app/models/lookup';
import {TabComponent} from '@app/shared/components/tab/tab.component';
import {OpenFrom} from '@app/enums/open-from.enum';
import {Country} from '@app/models/country';
import {catchError, exhaustMap, filter, map, takeUntil, tap} from 'rxjs/operators';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {CountryService} from '@app/services/country.service';
import {
  ImplementingAgencyListComponent
} from '@app/projects/shared/implementing-agency-list/implementing-agency-list.component';
import {
  InterventionRegionListComponent
} from '@app/projects/shared/intervention-region-list/intervention-region-list.component';
import {
  InterventionFieldListComponent
} from '@app/projects/shared/intervention-field-list/intervention-field-list.component';
import {ServiceRequestTypes, UrgentInterventionAnnouncementRequestType} from '@app/enums/service-request-types';
import {CommonUtils} from '@app/helpers/common-utils';
import {CustomValidators} from '@app/validators/custom-validators';
import {UrgentInterventionReportSearchCriteria} from '@app/models/urgent-intervention-report-search-criteria';
import {UrgentInterventionReportResult} from '@app/models/urgent-intervention-report-result';
import {CommonCaseStatus} from '@app/enums/common-case-status.enum';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'urgent-intervention-report',
  templateUrl: './urgent-intervention-report.component.html',
  styleUrls: ['./urgent-intervention-report.component.scss']
})
export class UrgentInterventionReportComponent extends EServicesGenericComponent<UrgentInterventionReport, UrgentInterventionReportingService> implements AfterViewInit {

  constructor(public lang: LangService,
              private cd: ChangeDetectorRef,
              public service: UrgentInterventionReportingService,
              private toastService: ToastService,
              private dialogService: DialogService,
              public fb: FormBuilder,
              private lookupService: LookupService,
              public employeeService: EmployeeService,
              private countryService: CountryService,
              private licenseService: LicenseService) {
    super();
  }

  ngAfterViewInit(): void {
    this.cd.detectChanges();
  }

  form!: FormGroup;
  requestTypesList: Lookup[] = this.lookupService.listByCategory.UrgentInterventionAnnouncementRequestType.slice().sort((a, b) => a.lookupKey - b.lookupKey);

  loadAttachments: boolean = false;

  licenseSearch$: Subject<string> = new Subject<string>();
  selectedLicense?: UrgentInterventionReport;
  countries: Country[] = [];

  tabsData: TabMap = {
    basicInfo: {
      name: 'basicInfoTab',
      langKey: 'lbl_basic_info' as keyof ILanguageKeys,
      index: 0,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => this.form && this.form.valid
    },
    entities: {
      name: 'entitiesTab',
      langKey: 'entities',
      index: 1,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => true,
      show: () => true,
      validStatus: () => {
        // if request type = start/edit, then entities will show and will be mandatory
        if (!this.isStartOrEditRequestType()) {
          return true;
        }
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
        // if request type = start/edit, then intervention areas will show and will be mandatory
        if (!this.isStartOrEditRequestType()) {
          return true;
        }
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
        // if request type = start/edit, then intervention fields will show and will be mandatory
        if (!this.isStartOrEditRequestType()) {
          return true;
        }
        return !this.interventionFieldListComponentRef || (this.interventionFieldsTabStatus === 'READY' && this.interventionFieldListComponentRef.list.length > 0);
      }
    },
    attachments: {
      name: 'attachmentsTab',
      langKey: 'attachments',
      index: 4,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => true
    }
  };
  tabIndex$: Subject<number> = new Subject<number>();

  @ViewChild('implementingAgencyListComponent') implementingAgencyListComponentRef!: ImplementingAgencyListComponent;
  @ViewChild('interventionRegionListComponent') interventionRegionListComponentRef!: InterventionRegionListComponent;
  @ViewChild('interventionFieldListComponent') interventionFieldListComponentRef!: InterventionFieldListComponent;

  entitiesTabStatus: ReadinessStatus = 'READY';
  interventionAreasTabStatus: ReadinessStatus = 'READY';
  interventionFieldsTabStatus: ReadinessStatus = 'READY';

  _buildForm(): void {
    let objUrgentInterventionReport = this._getNewInstance();
    this.form = this.fb.group(objUrgentInterventionReport.getBasicFormFields(true));
  }

  _afterBuildForm(): void {
    this.handleReadonly();

    if (this.fromDialog) {
      this.loadSelectedLicenseById(this.model!.oldLicenseId, () => {
        this.oldLicenseFullSerialField.updateValueAndValidity();
      });
    }
  }

  get requestTypeField(): FormControl {
    return (this.form?.get('requestType')) as FormControl;
  }

  get oldLicenseFullSerialField(): FormControl {
    return (this.form?.get('oldLicenseFullSerial')) as FormControl;
  }

  get executionCountryField(): FormControl {
    return (this.form?.get('executionCountry')) as FormControl;
  }

  licenseSearch($event?: Event): void {
    $event?.preventDefault();
    const value = this.oldLicenseFullSerialField.value && this.oldLicenseFullSerialField.value.trim();
    this.licenseSearch$.next(value);
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (!this.requestTypeField.value || ((this.requestTypeField.value === UrgentInterventionAnnouncementRequestType.START || this.requestTypeField.value === UrgentInterventionAnnouncementRequestType.EDIT) && !this.selectedLicense)) {
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

  private _updateModelAfterSave(model: UrgentInterventionReport): void {
    if ((this.openFrom === OpenFrom.USER_INBOX || this.openFrom === OpenFrom.TEAM_INBOX) && this.model?.taskDetails && this.model.taskDetails.tkiid) {
      this.service.getTask(this.model.taskDetails.tkiid)
        .subscribe((model) => {
          this.model = model;
        });
    } else {
      this.model = model;
    }
  }

  _afterSave(model: UrgentInterventionReport, saveType: SaveTypes, operation: OperationTypes): void {
    this._updateModelAfterSave(model);
    if (
      (operation === OperationTypes.CREATE && saveType === SaveTypes.FINAL) ||
      (operation === OperationTypes.UPDATE && saveType === SaveTypes.COMMIT)
    ) {
      this.dialogService.success(this.lang.map.msg_request_has_been_added_successfully.change({serial: model.fullSerial}));
    } else {
      this.toastService.success(this.lang.map.request_has_been_saved_successfully);
    }
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    return !!this.model && this.form.valid && this.model.canStart();
  }

  _afterLaunch(): void {
    this._resetForm();
    this.toastService.success(this.lang.map.request_has_been_sent_successfully);
  }

  _destroyComponent(): void {
  }

  _getNewInstance(): UrgentInterventionReport {
    return new UrgentInterventionReport();
  }

  _initComponent(): void {
    this.loadCountries();
    this.listenToLicenseSearch();
  }

  _launchFail(error: any): void {
    console.log('problem in launch');
  }

  _prepareModel(): Observable<UrgentInterventionReport> | UrgentInterventionReport {
    let value = (new UrgentInterventionReport()).clone({
      ...this.model,
      ...this.form.getRawValue(),
      interventionFieldList: this.interventionFieldListComponentRef.list,
      interventionRegionList: this.interventionRegionListComponentRef.list,
      implementingAgencyList: this.implementingAgencyListComponentRef.list
    });
    if (this.operation === this.operationTypes.CREATE){
      value.interventionLicenseId = this.service.preValidatedLicenseIdForAddOperation;
    }
    return value;
  }

  _resetForm(): void {
    this.form.reset();
    this.model = this._getNewInstance();
    this.operation = this.operationTypes.CREATE;
    this.setSelectedLicense(undefined, true);
  }

  _saveFail(error: any): void {
    console.log('problem in save');
  }

  _updateForm(model: UrgentInterventionReport | undefined): void {
    this.model = model;
    // patch the form here
    if (!model) {
      this.cd.detectChanges();
      return;
    }

    this.form.patchValue(model.getBasicFormFields());
    this.handleRequestTypeChange(model.requestType, false);
    this.cd.detectChanges();
  }


  onTabChange($event: TabComponent) {
    this.loadAttachments = $event.name === this.tabsData.attachments.name;
  }

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }

  /*getTabInvalidStatus(tabName: string): boolean {
    let validStatus = this.tabsData[tabName].validStatus();
    if (!this.tabsData[tabName].checkTouchedDirty) {
      return !validStatus;
    }
    return !validStatus && this.tabsData[tabName].isTouchedOrDirty();
  }*/

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

  isEditRequestTypeAllowed(): boolean {
    // allow edit if new record or saved as draft
    return !this.model?.id || (!!this.model?.id && this.model.canCommit());
  }

  isEditLicenseAllowed(): boolean {
    // if new or draft record and request type !== new, edit is allowed
    let isAllowed = !this.model?.id || (!!this.model?.id && this.model.canCommit());
    return isAllowed && CommonUtils.isValidValue(this.requestTypeField.value) &&
      (this.requestTypeField.value == UrgentInterventionAnnouncementRequestType.START
        || this.requestTypeField.value == UrgentInterventionAnnouncementRequestType.EDIT);
  }

  handleRequestTypeChange(requestTypeValue: number, userInteraction: boolean = false): void {
    if (userInteraction) {
      this._resetForm();
      this.requestTypeField.setValue(requestTypeValue);
    }

    this._handleRequestTypeDependentControls();
    this._handleLicenseValidationsByRequestType();
  }

  private _handleRequestTypeDependentControls(): void {

  }

  private _handleLicenseValidationsByRequestType(): void {
    let requestTypeValue = this.requestTypeField && this.requestTypeField.value;

    // set validators to empty
    this.oldLicenseFullSerialField?.setValidators([]);

    // if no requestType
    // if new record or draft, reset license and its validations
    // also reset the values in model
    if (!requestTypeValue || (requestTypeValue === ServiceRequestTypes.NEW)) {
      if (!this.model?.id || this.model.canCommit()) {
        this.oldLicenseFullSerialField.reset();
        this.oldLicenseFullSerialField.setValidators([]);
        this.setSelectedLicense(undefined, true);

        /*if (this.model) {
          this.model.licenseNumber = '';
          // this.model.licenseDuration = 0;
          this.model.licenseStartDate = '';
        }*/
      }
    } else {
      this.oldLicenseFullSerialField.setValidators([CustomValidators.required, (control) => {
        return this.selectedLicense && this.selectedLicense?.fullSerial === control.value ? null : {select_license: true};
      }]);
    }
    this.oldLicenseFullSerialField.updateValueAndValidity();
  }

  private loadSelectedLicenseById(id: string, callback?: any): void {
    if (!id) {
      return;
    }
    this.licenseService.loadUrgentInterventionReportByLicenseId(id)
      .pipe(
        filter(license => !!license),
        takeUntil(this.destroy$)
      )
      .subscribe((license) => {
        this.setSelectedLicense(license, true);

        callback && callback();
      });
  }

  addCountry($event?: MouseEvent): void {
    $event?.preventDefault();
    this.countryService.openCreateDialog()
      .pipe(takeUntil(this.destroy$))
      .subscribe((dialog: DialogRef) => {
        dialog.onAfterClose$.subscribe(() => {
          this.loadCountries();
        });
      });
  }

  private loadCountries(): void {
    this.countryService.loadCountries()
      .pipe(takeUntil(this.destroy$))
      .subscribe((countries) => this.countries = countries);
  }

  handleChangeExecutionCountry(country: number, userInteraction: boolean) {
    if (userInteraction) {
      this.implementingAgencyListComponentRef.forceClearComponent();
      this.interventionRegionListComponentRef.forceClearComponent();
      this.interventionFieldListComponentRef.forceClearComponent();
    }
  }

  isStartOrEditRequestType(): boolean {
    return this.requestTypeField.value === UrgentInterventionAnnouncementRequestType.START
      || this.requestTypeField.value === UrgentInterventionAnnouncementRequestType.EDIT;
  }

  handleReadonly(): void {
    // if record is new, no readonly (don't change as default is readonly = false)
    if (!this.model?.id) {
      return;
    }

    let caseStatus = this.model.getCaseStatus();
    if (CommonCaseStatus && (caseStatus == CommonCaseStatus.FINAL_APPROVE || caseStatus === CommonCaseStatus.FINAL_REJECTION)) {
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
    this._handleRequestTypeDependentControls();
  }

  private validateSingleLicense(license: UrgentInterventionReportResult): Observable<undefined | UrgentInterventionReport> {
    return this.licenseService.validateLicenseByRequestType<UrgentInterventionReport>(this.model!.caseType, this.requestTypeField.value, license.id) as Observable<undefined | UrgentInterventionReport>;
  }

  private openSelectLicense(licenses: UrgentInterventionReportResult[]): Observable<undefined | UrgentInterventionReport> {
    return this.licenseService.openSelectLicenseDialog(licenses, this.model?.clone({requestType: this.requestTypeField.value || null}), true, this.service.selectLicenseDisplayColumns)
      .onAfterClose$
      .pipe(map((result: ({ selected: UrgentInterventionReport, details: UrgentInterventionReport } | undefined)) => result ? result.details : result));
  }

  private listenToLicenseSearch() {
    this.licenseSearch$
      .pipe(
        takeUntil(this.destroy$),
        exhaustMap(oldLicenseFullSerial => {
          return this.loadLicencesByCriteria({fullSerial: oldLicenseFullSerial})
            .pipe(catchError(() => of([])));
        }))
      .pipe(
        // display message in case there is no returned license
        tap(list => !list.length ? this.dialogService.info(this.lang.map.no_result_for_your_search_criteria) : null),
        // allow only the collection if it has value
        filter(result => !!result.length),
        exhaustMap((licenses) => {
          return licenses.length === 1 ? this.validateSingleLicense(licenses[0]) : this.openSelectLicense(licenses);
        }),
        filter((info): info is UrgentInterventionReport => !!info),
      )
      .subscribe((selection) => {
        this.setSelectedLicense(selection, false);
      });
  }

  private setSelectedLicense(licenseDetails: UrgentInterventionReport | undefined, ignoreUpdateForm: boolean) {
    this.selectedLicense = licenseDetails;
    // update form fields if i have license
    if (licenseDetails && !ignoreUpdateForm) {
      let value: any = (new UrgentInterventionReport()).clone(licenseDetails);
      value.requestType = this.requestTypeField.value;
      value.oldLicenseFullSerial = licenseDetails.fullSerial;
      value.oldLicenseId = licenseDetails.id;
      value.oldLicenseSerial = licenseDetails.serial;
      value.documentTitle = '';
      value.fullSerial = null;

      // delete id because license details contains old license id, and we are adding new, so no id is needed
      delete value.id;
      delete value.vsId;

      this._updateForm(value);
    }
  }

  loadLicencesByCriteria(criteria: Partial<UrgentInterventionReportSearchCriteria>): Observable<UrgentInterventionReportResult[]> {
    return this.service.licenseSearch(criteria);
  }
}
