import {ChangeDetectorRef, Component} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {UrgentInterventionLicensingService} from '@app/services/urgent-intervention-licensing.service';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {UrgentInterventionLicense} from '@app/models/urgent-intervention-license';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ToastService} from '@app/services/toast.service';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {Observable, of, Subject} from 'rxjs';
import {SaveTypes} from '@app/enums/save-types';
import {CommonUtils} from '@app/helpers/common-utils';
import {DialogService} from '@app/services/dialog.service';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {OpenFrom} from '@app/enums/open-from.enum';
import {ServiceRequestTypes} from '@app/enums/service-request-types';
import {EmployeeService} from '@app/services/employee.service';
import {catchError, exhaustMap, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {InternalProjectLicenseResult} from '@app/models/internal-project-license-result';
import {LicenseService} from '@app/services/license.service';
import {SharedService} from '@app/services/shared.service';
import {UrgentInterventionLicenseResult} from '@app/models/urgent-intervention-license-result';
import {UrgentInterventionLicenseSearchCriteria} from '@app/models/urgent-intervention-license-search-criteria';
import {CaseTypes} from '@app/enums/case-types.enum';
import {TabComponent} from '@app/shared/components/tab/tab.component';
import {Lookup} from '@app/models/lookup';
import {LookupService} from '@app/services/lookup.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {FileIconsEnum} from '@app/enums/file-extension-mime-types-icons.enum';
import {DacOcha} from '@app/models/dac-ocha';
import {DacOchaService} from '@app/services/dac-ocha.service';
import {Domains} from '@app/enums/domains.enum';
import {DatepickerOptionsMap} from '@app/types/types';
import {DateUtils} from '@app/helpers/date-utils';
import {InternalProjectLicense} from '@app/models/internal-project-license';
import {ServiceDataService} from '@app/services/service-data.service';

@Component({
  selector: 'urgent-intervention-license',
  templateUrl: './urgent-intervention-license.component.html',
  styleUrls: ['./urgent-intervention-license.component.scss']
})
export class UrgentInterventionLicenseComponent extends EServicesGenericComponent<UrgentInterventionLicense, UrgentInterventionLicensingService> {

  constructor(public lang: LangService,
              private cd: ChangeDetectorRef,
              public service: UrgentInterventionLicensingService,
              private toastService: ToastService,
              private dialogService: DialogService,
              public fb: FormBuilder,
              private lookupService: LookupService,
              public employeeService: EmployeeService,
              private licenseService: LicenseService,
              private sharedService: SharedService,
              private serviceDataService: ServiceDataService) {
    super();
  }

  form!: FormGroup;
  requestTypesList: Lookup[] = this.lookupService.listByCategory.ServiceRequestType.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  loadAttachments: boolean = false;

  fileIconsEnum = FileIconsEnum;
  tabsData: IKeyValue = {
    basicInfo: {
      name: 'basicInfoTab',
      langKey: 'lbl_basic_info' as keyof ILanguageKeys,
      index: 0,
      validStatus: () => this.basicInfoGroup && this.basicInfoGroup.valid
    },
    emergencyFunds: {
      name: 'emergencyFundsTab',
      langKey: 'emergency_funds_info',
      index: 1,
      validStatus: () => this.emergencyFundsGroup && this.emergencyFundsGroup.valid
    },
    projectSummary: {
      name: 'projectSummaryTab',
      langKey: 'project_summary_info',
      index: 2,
      validStatus: () => this.projectSummaryGroup && this.projectSummaryGroup.valid
    },
    specialExplanations: {
      name: 'specialExplanationsTab',
      langKey: 'special_explanations',
      index: 3,
      validStatus: () => this.specialExplanationsField && this.specialExplanationsField.valid
    },
    attachments: {
      name: 'attachmentsTab',
      langKey: 'attachments',
      index: 4,
      validStatus: () => true
    }
  };
  tabIndex$: Subject<number> = new Subject<number>();

  licenseSearch$: Subject<string> = new Subject<string>();
  selectedLicense?: UrgentInterventionLicense;

  ngAfterViewInit(): void {
    this.cd.detectChanges();
  }

  _buildForm(): void {
    let objUrgentIntervention = this._getNewInstance();
    this.form = this.fb.group({
      basicInfo: this.fb.group(objUrgentIntervention.getBasicFormFields(true)),
      emergencyFunds: this.fb.group(objUrgentIntervention.getEmergencyFundFields(true)),
      projectSummary: this.fb.group(objUrgentIntervention.getProjectSummaryFields(true)),
      description: this.fb.control(objUrgentIntervention.description, CustomValidators.required)
    });
  }

  _destroyComponent(): void {
  }

  _getNewInstance(): UrgentInterventionLicense {
    return (new UrgentInterventionLicense()).clone();
  }

  _initComponent(): void {
    this.listenToLicenseSearch();
  }

  _afterBuildForm(): void {
    this._setMaxTargetAmount();
    this.handleReadonly();
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

  private _updateModelAfterSave(model: UrgentInterventionLicense): void {
    if ((this.openFrom === OpenFrom.USER_INBOX || this.openFrom === OpenFrom.TEAM_INBOX) && this.model?.taskDetails && this.model.taskDetails.tkiid) {
      this.service.getTask(this.model.taskDetails.tkiid)
        .subscribe((model) => {
          this.model = model;
        })
    } else {
      this.model = model;
    }
  }

  _afterSave(model: UrgentInterventionLicense, saveType: SaveTypes, operation: OperationTypes): void {
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

  _launchFail(error: any): void {
  }

  _prepareModel(): Observable<UrgentInterventionLicense> | UrgentInterventionLicense {
    return (new UrgentInterventionLicense()).clone({
      ...this.model,
      ...this.basicInfoGroup.getRawValue(),
      ...this.emergencyFundsGroup.getRawValue(),
      ...this.projectSummaryGroup.getRawValue(),
      description: this.specialExplanationsField.value,
    });
  }

  _saveFail(error: any): void {
    console.log('problem in save');
  }

  _updateForm(model: UrgentInterventionLicense): void {
    this.model = model;
    // patch the form here
    if (!model) {
      this.cd.detectChanges();
      return;
    }

    this.form.patchValue({
      basicInfo: model.getBasicFormFields(),
      emergencyFunds: model.getEmergencyFundFields(),
      projectSummary: model.getProjectSummaryFields(),
      description: model.description
    });

    this.handleRequestTypeChange(model.requestType, false);
    this.cd.detectChanges();
  }

  _resetForm(): void {
    this.form.reset();
    this.model = this._getNewInstance();
    this.operation = this.operationTypes.CREATE;
    this.setSelectedLicense(undefined, true);
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

  get basicInfoGroup(): FormGroup {
    return (this.form.get('basicInfo')) as FormGroup;
  }

  get emergencyFundsGroup(): FormGroup {
    return (this.form.get('emergencyFunds')) as FormGroup;
  }

  get projectSummaryGroup(): FormGroup {
    return (this.form.get('projectSummary')) as FormGroup;
  }

  get requestTypeField(): FormControl {
    return (this.basicInfoGroup?.get('requestType')) as FormControl;
  }

  get oldLicenseFullSerialField(): FormControl {
    return (this.basicInfoGroup?.get('oldLicenseFullSerial')) as FormControl;
  }

  get targetAmountField(): FormControl {
    return (this.emergencyFundsGroup?.get('targetAmount')) as FormControl;
  }

  get specialExplanationsField(): AbstractControl {
    return (this.form.get('description')) as FormControl;
  }

  handleReadonly(): void {
    // if record is new, no readonly (don't change as default is readonly = false)
    if (!this.model?.id) {
      return;
    }

    let caseStatus = this.model.getCaseStatus(),
      caseStatusEnum = this.service.caseStatusEnumMap[this.model.getCaseType()];

    if (caseStatusEnum && (caseStatus == caseStatusEnum.FINAL_APPROVE || caseStatus === caseStatusEnum.FINAL_REJECTION)) {
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

  isEditRequestTypeAllowed(): boolean {
    // allow edit if new record or saved as draft
    return !this.model?.id || (!!this.model?.id && this.model.canCommit());
  }

  isEditLicenseAllowed(): boolean {
    // if new or draft record and request type !== new, edit is allowed
    let isAllowed = !this.model?.id || (!!this.model?.id && this.model.canCommit());
    return isAllowed && CommonUtils.isValidValue(this.requestTypeField.value) && this.requestTypeField.value !== ServiceRequestTypes.NEW;
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

        if (this.model) {
          this.model.licenseNumber = '';
          this.model.licenseDuration = 0;
          this.model.licenseStartDate = '';
        }
      }
    } else {
      this.oldLicenseFullSerialField.setValidators([CustomValidators.required, (control) => {
        return this.selectedLicense && this.selectedLicense?.fullSerial === control.value ? null : {select_license: true}
      }]);
    }
    this.oldLicenseFullSerialField.updateValueAndValidity();
  }

  licenseSearch($event?: Event): void {
    $event?.preventDefault();
    const value = this.oldLicenseFullSerialField.value && this.oldLicenseFullSerialField.value.trim();
    this.licenseSearch$.next(value);
  }

  private listenToLicenseSearch() {
    this.licenseSearch$
      .pipe(exhaustMap(oldLicenseFullSerial => {
        return this.loadLicencesByCriteria({fullSerial: oldLicenseFullSerial})
          .pipe(catchError(() => of([])))
      }))
      .pipe(
        // display message in case there is no returned license
        tap(list => !list.length ? this.dialogService.info(this.lang.map.no_result_for_your_search_criteria) : null),
        // allow only the collection if it has value
        filter(result => !!result.length),
        // switch to the dialog ref to use it later and catch the user response
        switchMap(licenses => {
          if (licenses.length === 1) {
            return this.licenseService.validateLicenseByRequestType(this.model!.getCaseType(), this.requestTypeField.value, licenses[0].id)
              .pipe(
                map((data) => {
                  if (!data) {
                    return of(null);
                  }
                  return {selected: licenses[0], details: data};
                }),
                catchError((e) => {
                  return of(null);
                })
              )
          } else {
            return this.licenseService.openSelectLicenseDialog(licenses, this.model?.clone({requestType: this.requestTypeField.value || null})).onAfterClose$;
          }
        }),
        // allow only if the user select license
        filter<{ selected: UrgentInterventionLicenseResult, details: UrgentInterventionLicense }, any>
        ((selection): selection is { selected: UrgentInterventionLicenseResult, details: UrgentInterventionLicense } => {
          return !!(selection);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((selection) => {
        this.setSelectedLicense(selection.details, false);
      })
  }

  private setSelectedLicense(licenseDetails: UrgentInterventionLicense | undefined, ignoreUpdateForm: boolean) {
    this.selectedLicense = licenseDetails;
    // update form fields if i have license
    if (licenseDetails && !ignoreUpdateForm) {
      let value: any = (new UrgentInterventionLicense()).clone(licenseDetails);
      value._finalizeSearchFields();
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

  loadLicencesByCriteria(criteria: Partial<UrgentInterventionLicenseSearchCriteria>): Observable<UrgentInterventionLicenseResult[]> {
    return this.service.licenseSearch(criteria);
  }

  isNewRequestType(): boolean {
    return this.requestTypeField.value && (this.requestTypeField.value === ServiceRequestTypes.NEW);
  }

  isRenewOrUpdateRequestType(): boolean {
    return this.requestTypeField.value && (this.requestTypeField.value === ServiceRequestTypes.RENEW || this.requestTypeField.value === ServiceRequestTypes.UPDATE);
  }

  isExtendOrCancelRequestType(): boolean {
    return this.requestTypeField.value && (this.requestTypeField.value === ServiceRequestTypes.EXTEND || this.requestTypeField.value === ServiceRequestTypes.CANCEL);
  }

  viewLicenseAsPDF(license: InternalProjectLicenseResult) {
    return this.licenseService.showLicenseContent(license, CaseTypes.URGENT_INTERVENTION_LICENSING)
      .subscribe((file) => {
        return this.sharedService.openViewContentDialog(file, license);
      });
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

  onTabChange($event: TabComponent) {
    this.loadAttachments = $event.name === this.tabsData.attachments.name;
  }

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }

  private _setMaxTargetAmount(maxTargetAmount?: number): void {
    if (maxTargetAmount) {
      this.targetAmountField.addValidators([Validators.max(maxTargetAmount)]);
      return;
    }
    this.serviceDataService.loadByCaseType(CaseTypes.URGENT_INTERVENTION_LICENSING)
      .pipe(
        takeUntil(this.destroy$),
      ).subscribe((item) => {
      if (item.maxTargetAmount > 0) {
        this.targetAmountField.addValidators([Validators.max(item.maxTargetAmount)]);
      }
    });
  }
}
