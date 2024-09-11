import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { AllRequestTypesEnum } from '@app/enums/all-request-types-enum';
import { CommonCaseStatus } from '@app/enums/common-case-status.enum';
import { OpenFrom } from '@app/enums/open-from.enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { ReportPeriodicityTypes } from '@app/enums/report-periodicity-types';
import { ReportTypes } from '@app/enums/report-types';
import { SaveTypes } from '@app/enums/save-types';
import { ServiceRequestTypes } from '@app/enums/service-request-types';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { AdminResult } from '@app/models/admin-result';
import { FinancialAnalysis } from '@app/models/financial-analysis';
import { FinancialReport } from '@app/models/financial-report';
import { Lookup } from '@app/models/lookup';
import { CommonService } from '@app/services/common.service';
import { DialogService } from '@app/services/dialog.service';
import { EmployeeService } from '@app/services/employee.service';
import { FinancialAnalysisService } from '@app/services/financial-analysis.service';
import { LangService } from '@app/services/lang.service';
import { LicenseService } from '@app/services/license.service';
import { LookupService } from '@app/services/lookup.service';
import { ToastService } from '@app/services/toast.service';
import { TabComponent } from '@app/shared/components/tab/tab.component';
import { TabMap } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { Observable, Subject, of } from 'rxjs';
import { catchError, exhaustMap, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-financial-analysis',
  templateUrl: './financial-analysis.component.html',
  styleUrls: ['./financial-analysis.component.scss']
})
export class FinancialAnalysisComponent extends EServicesGenericComponent<
  FinancialAnalysis,
  FinancialAnalysisService
> implements AfterViewInit {
  constructor(
    public fb: UntypedFormBuilder,
    public service: FinancialAnalysisService,
    public employeeService: EmployeeService,
    public lang: LangService,
    private cd: ChangeDetectorRef,
    private toastService: ToastService,
    private dialog: DialogService,
    private lookupService: LookupService,
    private licenseService: LicenseService,
    private commonService: CommonService,
  ) {
    super();
  }


  form!: UntypedFormGroup;
  selectedLicense?: FinancialAnalysis;
  licenseSearch$: Subject<string> = new Subject<string>();
  loadAttachments: boolean = false;
  tabIndex$: Subject<number> = new Subject<number>();
  // requestTypesList: Lookup[] = this.lookupService.listByCategory.RequestTypeNewUpdate.sort(
  //   (a, b) => a.lookupKey - b.lookupKey
  // );
  requestTypesList: Lookup[] = this.lookupService.listByCategory.RequestTypeNewOnly;
  reportPeriodicityList: Lookup[] = this.lookupService.listByCategory.ReportPeriodicity.sort(
    (a, b) => a.lookupKey - b.lookupKey
  );
  halfTypeList: Lookup[] = this.lookupService.listByCategory.HalfType;
  quarterTypeList: Lookup[] = this.lookupService.listByCategory.QuarterType;
  reportTypes: FinancialReport[] = [];
  externalOfficeList: AdminResult[] = []
  inputMaskPatterns = CustomValidators.inputMaskPatterns;


  onTabChange($event: TabComponent) {
    this.loadAttachments = $event.name === this.tabsData.attachments.name;
  }
  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }
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
    specialExplanations: {
      name: 'specialExplanationsTab',
      langKey: 'special_explanations',
      index: 6,
      isTouchedOrDirty: () => true,
      show: () => true,
      validStatus: () =>
        this.specialExplanationsField && this.specialExplanationsField.valid,
    },
    attachments: {
      name: 'attachmentsTab',
      langKey: 'attachments',
      index: 7,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => true,
    },
  };
  ngAfterViewInit(): void {
    this._listenToLicenseSearch();
    this._listToReportPeriodicityChange();
    this._listToReportTypeChange();

  }
  //#region Case Model
  _initComponent(): void {
  }

  _buildForm(): void {
    let objFinancialAnalysis = this._getNewInstance();
    this.form = this.fb.group({
      basicInfo: this.fb.group(
        objFinancialAnalysis.getBasicInfoFields(true)
      ),

      customTerms: this.fb.control(objFinancialAnalysis.customTerms,
        [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]),
    });
  }

  _afterBuildForm(): void {
    this.handleReadonly();
    if (!this.model?.id) {
      this._setDefaultValues();
    }
    if (this.fromDialog) {
      this._loadSelectedLicenseById(this.model!.oldLicenseId, () => {
        this.oldLicenseSerialField.updateValueAndValidity();
      });
    }
  }

  _afterLaunch(): void {
    this.resetForm$.next(false);
    this.toastService.success(this.lang.map.request_has_been_sent_successfully);
  }

  _afterSave(
    model: FinancialAnalysis,
    saveType: SaveTypes,
    operation: OperationTypes
  ): void {
    this._updateModelAfterSave(model);

    if (
      (operation === OperationTypes.CREATE && saveType === SaveTypes.FINAL) ||
      (operation === OperationTypes.UPDATE && saveType === SaveTypes.COMMIT)
    ) {
      this.dialog.success(
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
      this.dialog.error(
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
        this.dialog.error(listHtml.outerHTML);
        return false;
      }
      return true;
    }
  }


  _destroyComponent(): void { }

  _getNewInstance(): FinancialAnalysis {
    return new FinancialAnalysis().clone();
  }

  _launchFail(error: any): void {
    console.log('problem in launch');
  }

  _prepareModel():
    | Observable<FinancialAnalysis>
    | FinancialAnalysis {
    return new FinancialAnalysis().clone({
      ...this.model,
      ...this.basicInfoTab.getRawValue(),
      customTerms: this.specialExplanationsField.value,
      year: Number(this.yearField.value),
    });
  }
  _setDefaultValues(): void {
    this.requestTypeField.setValue(ServiceRequestTypes.NEW);
    this.handleRequestTypeChange(ServiceRequestTypes.NEW, false);
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

  _updateForm(model: FinancialAnalysis | undefined): void {
    this.model = model;
    if (!model) {
      this.cd.detectChanges();
      return;
    }
    this.handleReportPeriodicityChange(model.reportPeriodicity)
    // patch the form here
    this.form.patchValue({
      basicInfo: model.getBasicInfoFields(),
    });
    this.specialExplanationsField.setValue(model.customTerms);

    this.handleRequestTypeChange(model.requestType, false);
    this.cd.detectChanges();
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
      if(this.employeeService.isExternalUser()){
        this.readonly = false;
      }else{
        this.readonly= true;
      }
     
    } else if (this.openFrom === OpenFrom.TEAM_INBOX) {
      // after claim, consider it same as user inbox and use same condition
      if (this.model.taskDetails.isClaimed()) {
        if(this.employeeService.isExternalUser()){
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
  handleRequestTypeChange(
    requestTypeValue: number,
    userInteraction: boolean = false
  ): void {
    of(userInteraction)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.confirmChangeRequestType(userInteraction))
      )
      .subscribe((clickOn: UserClickOn) => {
        if (clickOn === UserClickOn.YES) {
          if (userInteraction) {
            this.resetForm$.next(false);
            this.requestTypeField.setValue(requestTypeValue);
            this.readonly = requestTypeValue === AllRequestTypesEnum.UPDATE;
          }
          this.requestType$.next(requestTypeValue);

          this._handleLicenseValidationsByRequestType();
        } else {
          this.requestTypeField.setValue(this.requestType$.value);
        }
      });
  }
  private _updateModelAfterSave(model: FinancialAnalysis): void {
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
    this.model?.id && this.service.documentService.loadDocuments(this.model.id).subscribe()

  }
  private _handleLicenseValidationsByRequestType(): void {
    let requestTypeValue = this.requestTypeField && this.requestTypeField.value;
    // set validators to empty
    if (!requestTypeValue || requestTypeValue === ServiceRequestTypes.NEW) {
      this.oldLicenseSerialField?.setValidators([]);
      if (!this.model?.id || this.model.canCommit()) {
        this.oldLicenseSerialField?.setValue(null);
        this.setSelectedLicense(undefined, true);

        if (this.model) {
          this.model.licenseNumber = '';
          this.model.licenseDuration = 0;
          this.model.licenseStartDate = '';
        }
      }
    } else {
      this.oldLicenseSerialField?.setValidators([
        CustomValidators.required,
        CustomValidators.maxLength(250),
      ]);
    }
    this.oldLicenseSerialField.updateValueAndValidity();
  }
  private _loadSelectedLicenseById(id: string, callback?: any): void {
    if (!id) {
      return;
    }
    this.licenseService
      .loadFinancialAnalysisByLicenseId(id)
      .pipe(
        filter((license) => !!license),
        takeUntil(this.destroy$)
      )
      .subscribe((license) => {
        this.setSelectedLicense(
          license.convertToFinancialAnalysis(),
          true
        );

        callback && callback();
      });
  }
  private _validateSingleLicense(license: FinancialAnalysis): Observable<undefined | FinancialAnalysis> {
    return this.licenseService.loadFinancialAnalysisById(
      license.fullSerial
    )as Observable<undefined | FinancialAnalysis>;
  }
  private _openSelectLicense(
    licenses: FinancialAnalysis[]
  ): Observable<undefined | FinancialAnalysis> {
    return this.licenseService
      .openSelectLicenseDialog(
        licenses,
        this.model?.clone({ requestType: this.requestTypeField.value || null }),
        true,
        this.service.selectLicenseDisplayColumnsReport
      )
      .onAfterClose$.pipe(
        map(
          (
            result:
              | {
                selected: FinancialAnalysis;
                details: FinancialAnalysis;
              }
              | undefined
          ) => {
            return result ? result.details : result;
          }
        )
      );
  }
  private _listenToLicenseSearch() {
    this.licenseSearch$
      .pipe(
        takeUntil(this.destroy$),
        exhaustMap((value) => {
          return this.loadLicensesByCriteria(value).pipe(catchError(() => of([])));
        })
      )
      .pipe(
        // display message in case there is no returned license
        tap((list) =>
          !list.length
            ? this.dialog.info(
              this.lang.map.no_result_for_your_search_criteria
            )
            : null
        ),
        // allow only the collection if it has value
        filter((result) => !!result.length),
        exhaustMap((licenses) => {
          return licenses.length === 1
            ? this._validateSingleLicense(licenses[0]).pipe(
              map((data) => {
                if (!data) {
                  return of(null);
                }
                return data;
              }),
              catchError(() => {
                return of(null);
              })
            )
            : this._openSelectLicense(licenses);
        }),
        filter((info): info is FinancialAnalysis => {
          return !!info;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((selection) => {
        this.setSelectedLicense(selection, false);
      });
  }
  private _listToReportPeriodicityChange() {
    this.reportPeriodicityField.valueChanges
      .pipe(
        tap((value: ReportPeriodicityTypes) => {
          this.handleReportPeriodicityChange(value)
        }),
        takeUntil(this.destroy$),
      )
      .subscribe()
  }
  private _listToReportTypeChange() {
    this.reportTypeField.valueChanges
      .pipe(
        takeUntil(this.destroy$),
      )
      .subscribe((value: ReportTypes) => {
        this.HandleReportTypeChange(value);
      })
  }
  private _loadExternalOffice() {
    this.commonService.loadExternalOffice(this.model!.organizationId)
      .subscribe(list => this.externalOfficeList = list)

  }
  loadLicensesByCriteria(oldApprovalSerial?:string): Observable<FinancialAnalysis[]> {
    return this.service.licenseSearch(this.employeeService.getProfile()!.profileType,oldApprovalSerial);
  }
  licenseSearch($event?: Event): void {
    $event?.preventDefault();
    const value =
      this.oldLicenseSerialField.value &&
      this.oldLicenseSerialField.value.trim();
    this.licenseSearch$.next(value);
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
  setSelectedLicense(
    licenseDetails: FinancialAnalysis | undefined,
    ignoreUpdateForm: boolean
  ) {
    this.selectedLicense = licenseDetails;
    // update form fields if i have license
    if (licenseDetails && !ignoreUpdateForm) {
      let value: any = new FinancialAnalysis().clone({
        ...licenseDetails,
      });
      value.requestType = this.requestTypeField.value;
      value.oldLicenseSerial = licenseDetails.fullSerial;
      value.oldLicenseId = licenseDetails.id;
      value.documentTitle = '';
      value.fullSerial = null;
      value.description = '';
      value.createdOn = '';
      value.classDescription = '';

      // delete id because license details contains old license id, and we are adding new, so no id is needed
      delete value.id;
      delete value.vsId;
      delete value.serial;

      // this.listenAllowed = false;

      this._updateForm(value);
    }
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
  //#region Inputs
  get basicInfoTab(): UntypedFormGroup {
    return this.form.get('basicInfo') as UntypedFormGroup;
  }

  get requestTypeField(): UntypedFormControl {
    return this.basicInfoTab.get('requestType') as UntypedFormControl;
  }
  get reportPeriodicityField(): UntypedFormControl {
    return this.basicInfoTab.get('reportPeriodicity') as UntypedFormControl;
  }
  get quarterTypeField(): UntypedFormControl {
    return this.basicInfoTab.get('quarterType') as UntypedFormControl;
  }
  get yearField(): UntypedFormControl {
    return this.basicInfoTab.get('year') as UntypedFormControl;
  }
  get halfTypeField(): UntypedFormControl {
    return this.basicInfoTab.get('halfType') as UntypedFormControl;
  }
  get externalOfficeIdField(): UntypedFormControl {
    return this.basicInfoTab.get('externalOfficeId') as UntypedFormControl;
  }
  get reportTypeField(): UntypedFormControl {
    return this.basicInfoTab.get('reportTypeId') as UntypedFormControl;
  }

  get oldLicenseSerialField(): UntypedFormControl {
    return this.basicInfoTab.get('oldLicenseSerial') as UntypedFormControl;
  }
  get specialExplanationsField(): UntypedFormControl {
    return this.form.get('customTerms') as UntypedFormControl;
  }
  //#endregion

  //#region Validations
  handleReportPeriodicityChange(value?: ReportPeriodicityTypes) {
    this.resetReportPeriodicityRelatedFields();
    if (!!value) {
      this.service.getReportTypes(value, this.model!.profileType)
          .subscribe(list => this.reportTypes = list)
    }
    if (value === ReportPeriodicityTypes.QUARTERLY) {
      this.setQuarterTypeRequired();
    }
    if (value === ReportPeriodicityTypes.SMI_ANNUAL) {
      this.setHalfTypeRequired();
    }
  }
  private isExternalOfficeRequired(value: ReportTypes): boolean {
    return value === ReportTypes.STATEMENT_OF_FINANCIAL_EXTERNAL_OFFICES ||
      value === ReportTypes.STATEMENT_OF_OPERATIONS_PROCESS_EXTERNAL_OFFICES ||
      value === ReportTypes.OFFICE_ADMINISTRATIVE_EXPENSES
  }
  HandleReportTypeChange(value: ReportTypes) {
    this.resetExternalOfficeId();
    if (this.isExternalOfficeRequired(value)) {
      this._loadExternalOffice();
      this.setExternalOfficeIdRequired();
    }
  }
  isQuarterTypeRequired = false;
  isHalfTypeRequired = false;
  isExternalOfficeIdRequired = false;

  resetReportPeriodicityRelatedFields() {
    this.isQuarterTypeRequired = false;
    this.quarterTypeField.setValidators([]);
    this.quarterTypeField.reset();
    this.quarterTypeField.updateValueAndValidity();

    this.isHalfTypeRequired = false;
    this.halfTypeField.setValidators([]);
    this.halfTypeField.reset();
    this.halfTypeField.updateValueAndValidity();

    this.reportTypeField.reset();
    this.reportTypeField.updateValueAndValidity();

  }
  setQuarterTypeRequired() {
    this.isQuarterTypeRequired = true;
    this.quarterTypeField.setValidators([CustomValidators.required]);
    this.quarterTypeField.updateValueAndValidity();
  }
  setHalfTypeRequired() {
    this.isHalfTypeRequired = true;
    this.halfTypeField.setValidators([CustomValidators.required]);
    this.halfTypeField.updateValueAndValidity();
  }
  resetExternalOfficeId() {
    this.isExternalOfficeIdRequired = false;
    this.externalOfficeIdField.setValidators([]);
    this.externalOfficeIdField.updateValueAndValidity();
  }
  setExternalOfficeIdRequired() {
    this.isExternalOfficeIdRequired = true;
    this.externalOfficeIdField.setValidators([CustomValidators.required]);
    this.externalOfficeIdField.updateValueAndValidity();
  }
  //#endregion
  
}


