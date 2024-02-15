import {OfficeTypes} from '@enums/office-type';
import {AfterViewInit, ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {Observable, of, Subject} from 'rxjs';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {IKeyValue} from '@contracts/i-key-value';
import {LangService} from '@services/lang.service';
import {LookupService} from '@services/lookup.service';
import {DialogService} from '@services/dialog.service';
import {ToastService} from '@services/toast.service';
import {catchError, exhaustMap, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {CustomValidators} from '@app/validators/custom-validators';
import {FinalExternalOfficeApproval} from '@models/final-external-office-approval';
import {OperationTypes} from '@enums/operation-types.enum';
import {FinalExternalOfficeApprovalService} from '@services/final-external-office-approval.service';
import {Lookup} from '@models/lookup';
import {Country} from '@models/country';
import {CountryService} from '@services/country.service';
import {DateUtils} from '@helpers/date-utils';
import {ServiceRequestTypes} from '@enums/service-request-types';
import {CommonUtils} from '@helpers/common-utils';
import {EmployeeService} from '@services/employee.service';
import {InitialExternalOfficeApprovalResult} from '@models/initial-external-office-approval-result';
import {LicenseService} from '@services/license.service';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {SaveTypes} from '@enums/save-types';
import {DatepickerOptionsMap, FieldControlAndLabelKey, ReadinessStatus} from '@app/types/types';
import {BankBranchComponent} from '@app/shared/components/bank-branch/bank-branch.component';
import {OpenFrom} from '@enums/open-from.enum';
import {FinalExternalOfficeApprovalResult} from '@models/final-external-office-approval-result';
import {InitialExternalOfficeApproval} from '@models/initial-external-office-approval';
import {TabComponent} from '@app/shared/components/tab/tab.component';
import {FileIconsEnum} from '@enums/file-extension-mime-types-icons.enum';
import {FinalExternalOfficeApprovalSearchCriteria} from '@models/final-external-office-approval-search-criteria';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {CommonCaseStatus} from '@enums/common-case-status.enum';
import {BankAccountComponent} from '@modules/services/shared-services/components/bank-account/bank-account.component';
import {ExecutiveManagementComponent} from '@app/shared/components/executive-management/executive-management.component';
import {UserClickOn} from '@enums/user-click-on.enum';
import {LicenseDurationType} from '@enums/license-duration-type';
import { AllRequestTypesEnum } from '@app/enums/all-request-types-enum';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'final-external-office-approval',
  templateUrl: './final-external-office-approval.component.html',
  styleUrls: ['./final-external-office-approval.component.scss']
})
export class FinalExternalOfficeApprovalComponent extends EServicesGenericComponent<FinalExternalOfficeApproval, FinalExternalOfficeApprovalService> implements AfterViewInit {
  form!: UntypedFormGroup;
  fileIconsEnum = FileIconsEnum;

  @ViewChild('bankAccountsTab') bankAccountComponentRef!: BankAccountComponent;
  @ViewChild('managersTab') executiveManagementComponentRef!: ExecutiveManagementComponent;
  @ViewChild('branchesTab') bankBranchComponentRef!: BankBranchComponent;

  tabsData: IKeyValue = {
    basicInfo: {
      name: 'basicInfoTab',
      langKey: 'lbl_basic_info',
      validStatus: () => this.form && this.form.valid
    },
    bankAccounts: {
      name: 'bankAccountsTab',
      langKey: 'bank_details',
      validStatus: () => {
        return !this.isUpdateOrRenewCase || (!this.bankAccountComponentRef ||  this.bankAccountComponentRef.list.length > 0);
      }
    },
    managers: {
      name: 'managersTab',
      langKey: 'managers',
      validStatus: () => {
        return !this.isUpdateOrRenewCase || (!this.executiveManagementComponentRef ||  this.executiveManagementComponentRef.list.length > 0);
      }
    },
    branches: {
      name: 'branchesTab',
      langKey: 'branches',
      validStatus: () => {
        return !this.bankAccountComponentRef || this.bankBranchComponentRef.list.length > 0 || !this.isRenewOrUpdateRequestType();
      }
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
    }
  };

  requestTypesList: Lookup[] = this.lookupService.listByCategory.ServiceRequestType.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  officeTypesList: Lookup[] = this.lookupService.listByCategory.officeType.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  LicenseDurationType: Lookup[] = this.lookupService.listByCategory.LicenseDurationType.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  serviceRequestTypes = ServiceRequestTypes;
  officeType = OfficeTypes;
  licenseDurationTypes = LicenseDurationType

  operation: OperationTypes = OperationTypes.CREATE;

  nationalities: Lookup[] = this.lookupService.listByCategory.Nationality;
  countriesList: Country[] = [];

  unprocessedLicensesList: any[] = [];
  licenseSearch$: Subject<string> = new Subject<string>();
  selectedLicense?: InitialExternalOfficeApproval | FinalExternalOfficeApproval;

  datepickerOptionsMap: DatepickerOptionsMap = {
    establishmentDate: DateUtils.getDatepickerOptions({disablePeriod: 'future'})
  };

  readonly: boolean = false;

  public isInternalUser: boolean = this.employeeService.isInternalUser();
  formProperties = {
    requestType: () => {
      return this.getObservableField('requestTypeField', 'requestType');
    }
  }

  loadAttachments: boolean = false;

  constructor(public lang: LangService,
              private cd: ChangeDetectorRef,
              public service: FinalExternalOfficeApprovalService,
              public lookupService: LookupService,
              private licenseService: LicenseService,
              private dialogService: DialogService,
              public employeeService: EmployeeService,
              private toastService: ToastService,
              private countryService: CountryService,
              public fb: UntypedFormBuilder) {
    super();
  }

  ngAfterViewInit() {
    this._handleRequestTypeDependentValidations();
    this.cd.detectChanges();
  }

  _getNewInstance(): FinalExternalOfficeApproval {
    return new FinalExternalOfficeApproval();
  }

  _initComponent(): void {
    this.loadCountries();
    this.listenToLicenseSearch();
  }

  _buildForm(): void {
    this.form = this.fb.group({
      basicInfo: this.fb.group((new FinalExternalOfficeApproval()).getFormFields(true))
    });
  }

  _afterBuildForm(): void {

    this.handleReadonly();
    if (this.fromDialog) {
      let licenseId: string, licenseField: UntypedFormControl;
      licenseId = this.model?.oldLicenseId!;
      licenseField = this.oldLicenseFullSerialField;

      this.loadSelectedLicenseById(licenseId, () => {
        licenseField.updateValueAndValidity();
      });
    }
  }

  private _getInvalidTabs(): any {
    let failedList: string[] = [];
    for (const key in this.tabsData) {
      // if (!(this.tabsData[key].formStatus() && this.tabsData[key].listStatus())) {
      if (!(this.tabsData[key].validStatus())) {
        // @ts-ignore
        failedList.push(this.lang.map[this.tabsData[key].langKey]);
      }
    }
    return failedList;
  }

  private _isValidDraftData(): boolean {
    const draftFields: FieldControlAndLabelKey[] = [
      {control: this.requestTypeField, labelKey: 'request_type'},
      {control: this.externalOfficeNameField, labelKey: 'external_office_name'},
      {control: this.countryField, labelKey: 'country'},
    ];
    const invalidDraftField = this.getInvalidDraftField(draftFields);
    if (invalidDraftField) {
      this.dialogService.error(this.lang.map.msg_please_validate_x_to_continue.change({x: this.lang.map[invalidDraftField.labelKey]}));
      invalidDraftField.control.markAsTouched();
      return false;
    }
    return true;
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (!this.selectedLicense && !this.isNewRequestType()) {
      this.dialogService.error(this.lang.map.please_select_license_to_complete_save);
      return false;
    } else {
      if (saveType === SaveTypes.DRAFT) {
        return this._isValidDraftData();
      }
      const invalidTabs = this._getInvalidTabs();
      // if (invalidTabs.length > 0 && !this.isRenewOrUpdateRequestType()) {
      if (invalidTabs.length > 0 ) {
        const listHtml = CommonUtils.generateHtmlList(this.lang.map.msg_following_tabs_valid, invalidTabs);
        this.dialogService.error(listHtml.outerHTML);
        return false;
      } else {
        return true;
      }
    }
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    return !!this.model && this.form.valid && this.model.canStart();
  }

  _afterLaunch(): void {
    this.resetForm$.next();
    this.toastService.success(this.lang.map.request_has_been_sent_successfully);
  }

  _prepareModel(): FinalExternalOfficeApproval | Observable<FinalExternalOfficeApproval> {
    let value = (new FinalExternalOfficeApproval()).clone({...this.model, ...this.form.value.basicInfo});
    /*// if new request, and selected licence is available, use the licence number from selected licence instead of value in field
    if (!value.id && this.selectedLicense) {
      if (this.isNewRequestType()) {
        value.initialLicenseNumber = this.selectedLicense.licenseNumber;
      } else {
        value.licenseNumber = this.selectedLicense.licenseNumber
      }
    }*/
    value.bankAccountList = this.bankAccountComponentRef.list;
    value.executiveManagementList = this.executiveManagementComponentRef.list;
    value.branchList = this.bankBranchComponentRef.list;
    return value;
  }

  private _updateModelAfterSave(model: FinalExternalOfficeApproval): void {
    if ((this.openFrom === OpenFrom.USER_INBOX || this.openFrom === OpenFrom.TEAM_INBOX) && this.model?.taskDetails && this.model.taskDetails.tkiid) {
      this.service.getTask(this.model.taskDetails.tkiid)
        .subscribe((model) => {
          this.model = model;
        });
    } else {
      this.model = model;
    }
  }

  _afterSave(model: FinalExternalOfficeApproval, saveType: SaveTypes, operation: OperationTypes): void {
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

  _saveFail(error: any): void {
    console.log('problem on save');
  }

  _launchFail(error: any): void {
    console.log(error);
  }

  _destroyComponent(): void {
    // throw new Error('Method not implemented.');
  }

  _updateForm(model: FinalExternalOfficeApproval): void {
    this.model = model;
    this.basicTab.patchValue(model.getFormFields());
    this.handleRequestTypeChange(model.requestType, false);
    this.cd.detectChanges();
  }

  _resetForm(): void {
    this.form.reset();
    this.model = this._getNewInstance();
    this.operation = this.operationTypes.CREATE;
    this.setSelectedLicense(undefined, true);
    this.setDefaultValuesForExternalUser();
    this.bankAccountComponentRef.forceClearComponent();
    this.executiveManagementComponentRef.forceClearComponent();
    this.bankBranchComponentRef.forceClearComponent();
  }

  getFieldInvalidStatus(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && (ctrl?.touched || ctrl?.dirty));
  }

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }

  private loadCountries(): void {
    this.countryService.loadAsLookups()
      .pipe(takeUntil(this.destroy$))
      .subscribe((countries) => this.countriesList = countries);
  }

  private setDefaultValuesForExternalUser(): void {
    if (!this.employeeService.isExternalUser() || this.operation !== this.operationTypes.CREATE) {
      return;
    }
    this.form.get('email')?.patchValue(this.employeeService.getExternalUser()?.email);
    this.form.get('phone')?.patchValue(this.employeeService.getExternalUser()?.phoneNumber);
  }

  handleCountryChange(_$event?: MouseEvent): void {
    this.regionField?.reset();
  }

  private _handleLicenseValidationsByRequestType(): void {
    // set validators to empty
    this.oldLicenseFullSerialField?.setValidators([]);

    // if no requestType.
    // if new record or draft, reset license and its validations
    // also reset the values in model
    if (!CommonUtils.isValidValue(this.requestTypeField?.value)) {
      if (!this.model?.id || this.model.canCommit()) {
        this.oldLicenseFullSerialField?.setValue(null);
        this.setSelectedLicense(undefined, true);

        if (this.model) {
          this.model.licenseNumber = '';
          this.model.licenseDuration = 0;
          this.model.licenseStartDate = '';
        }
      }
    } else {
      if (!this.isNewRequestType())
        this.oldLicenseFullSerialField?.setValidators([CustomValidators.required, (control) => {
          return this.selectedLicense && this.selectedLicense?.fullSerial === control.value ? null : {select_license: true};
        }]);
    }
    this.oldLicenseFullSerialField.updateValueAndValidity();
  }

  private _handleRequestTypeDependentValidations(): void {

  }

  handleLicenseDurationTypeChange() {
    const prevV = this.licenseDurationField.value;
    this.licenseDurationField.setValidators([]);
    this.licenseDurationField.reset();
    if (this.isTemporaryLicenseDurationTypes()) {
      this.licenseDurationField.setValidators([Validators.required]);
      this.licenseDurationField.setValue(prevV);
    }
  }

  handleOfficeTypeChenge() {
    const prevV = this.countriesField.value;
    this.countriesField.setValidators([]);
    if (this.isInternationalOfficeType()) {
      this.countriesField.setValidators([Validators.required]);
    }
    this.countriesField.reset();
    this.countriesField.setValue(prevV);
  }

  isTemporaryLicenseDurationTypes() {
    return this.licenseDurationTypeField.value == LicenseDurationType.TEMPORARY
  }

  isInternationalOfficeType() {
    return this.officeTypeField.value == OfficeTypes.INTERNATIONAL
  }

  handleRequestTypeChange(requestTypeValue: number, userInteraction: boolean = false): void {
    of(userInteraction).pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.confirmChangeRequestType(userInteraction))
    ).subscribe((clickOn: UserClickOn) => {
      if (clickOn === UserClickOn.YES) {
        if (userInteraction) {
          this.resetForm$.next();
          this.requestTypeField.setValue(requestTypeValue);
        }

        this._handleLicenseValidationsByRequestType();
        this._handleRequestTypeDependentValidations();
        this.requestType$.next(requestTypeValue);
      } else {
        this.requestTypeField.setValue(this.requestType$.value);
      }
    });
  }

  licenseSearch($event?: Event): void {
    $event?.preventDefault();
    let value = '';
    if (this.requestTypeField.valid) {
      value = this.oldLicenseFullSerialField.value;
    }
    /*if (!CommonUtils.isValidValue(value)) {
      this.dialogService.info(this.lang.map.need_license_number_to_search);
      return;
    }*/
    this.licenseSearch$.next(value);
  }


  loadLicencesByCriteria(criteria: (Partial<FinalExternalOfficeApprovalSearchCriteria>)): (Observable<FinalExternalOfficeApprovalResult[]>) {
    return this.service.licenseSearch(criteria as Partial<FinalExternalOfficeApprovalSearchCriteria>);
  }

  listenToLicenseSearch(): void {
    this.licenseSearch$
      .pipe(exhaustMap(oldLicenseFullSerial => {
        return this.loadLicencesByCriteria({fullSerial: oldLicenseFullSerial})
          .pipe(catchError(() => of([])));
      }))
      .pipe(
        // display message in case there is no returned license
        tap(list => {
          if (!list.length) {
            this.dialogService.info(this.lang.map.no_result_for_your_search_criteria);
          }
        }),
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
                catchError(() => {
                  return of(null);
                })
              );
          } else {
            const displayColumns = this.service.selectLicenseDisplayColumns;
            return this.licenseService.openSelectLicenseDialog(licenses, this.model?.clone({requestType: this.requestTypeField.value || null}), true, displayColumns).onAfterClose$;
          }
        }),
        // allow only if the user select license
        filter<{ selected: InitialExternalOfficeApprovalResult | FinalExternalOfficeApprovalResult, details: InitialExternalOfficeApproval | FinalExternalOfficeApproval }, any>
        ((selection): selection is ({ selected: InitialExternalOfficeApprovalResult | FinalExternalOfficeApprovalResult, details: InitialExternalOfficeApproval | FinalExternalOfficeApproval }) => {
          return (selection && selection.selected instanceof InitialExternalOfficeApprovalResult && selection.details instanceof InitialExternalOfficeApproval) || (selection && selection.selected instanceof FinalExternalOfficeApprovalResult && selection.details instanceof FinalExternalOfficeApproval);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((selection) => {
        this.setSelectedLicense(selection.details, false);
      });
  }

  private setSelectedLicense(licenseDetails: FinalExternalOfficeApproval | undefined, ignoreUpdateForm: boolean) {
    this.selectedLicense = licenseDetails;
    if (licenseDetails && !ignoreUpdateForm) {
      let requestType = this.requestTypeField?.value,
        result: Partial<FinalExternalOfficeApproval> = {
          country: licenseDetails.country,
          region: licenseDetails.region,
          requestType: requestType,
          licenseDuration: licenseDetails.licenseDuration,
          licenseStartDate: licenseDetails.licenseStartDate
        };

      result.oldLicenseFullSerial = licenseDetails.fullSerial;
      result.oldLicenseId = licenseDetails.id;
      result.oldLicenseSerial = licenseDetails.serial;

      if (licenseDetails instanceof FinalExternalOfficeApproval) {
        result.externalOfficeName = licenseDetails.externalOfficeName;
        result.establishmentDate = licenseDetails.establishmentDate;
        result.recordNo = licenseDetails.recordNo;
        result.address = licenseDetails.address;
        result.postalCode = licenseDetails.postalCode;
        result.phone = licenseDetails.phone;
        result.email = licenseDetails.email;
        result.licenseDuration = licenseDetails.licenseDuration;
        result.licenseDurationType = licenseDetails.licenseDurationType
        result.headQuarterType = licenseDetails.headQuarterType;
        result.countries = licenseDetails.countries;
        result.fax = licenseDetails.fax;
        result.description = licenseDetails.description;
        result.bankAccountList = (licenseDetails as FinalExternalOfficeApproval).bankAccountList;
        result.executiveManagementList = (licenseDetails as FinalExternalOfficeApproval).executiveManagementList;
        result.branchList = (licenseDetails as FinalExternalOfficeApproval).branchList;
      }

      this._updateForm((new FinalExternalOfficeApproval()).clone(result));
      this.handleLicenseDurationTypeChange();
      this.handleOfficeTypeChenge();
    } else {
      this.countryField.updateValueAndValidity();
    }
  }

  private loadSelectedLicenseById(id: string, callback?: any): void {
    if (!id) {
      return;
    }
    let response: Observable<FinalExternalOfficeApproval>;
    response = this.licenseService.loadFinalLicenseByLicenseId(id);

    response
      .pipe(
        filter(license => !!license),
        takeUntil(this.destroy$)
      )
      .subscribe((license) => {
        this.setSelectedLicense(license, true);

        callback && callback();
      });
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
      // if saved as draft and opened by creator who is charity user, then no readonly
      if (this.model?.canCommit()) {
        this.readonly = false;
      }
      /*if (this.employeeService.isCharityUser() && this.employeeService.getUser()?.id === this.model.creatorInfo?.id) {
        this.readonly = false;
      }*/
    }
  }

  isEditRequestTypeAllowed(): boolean {
    // allow edit if new record or saved as draft
    return !this.model?.id || (!!this.model?.id && this.model.canCommit());
  }

  isEditLicenseAllowed(): boolean {
    // if new or draft record, edit is allowed
    let isAllowed = !this.model?.id || (!!this.model?.id && this.model.canCommit());
    return isAllowed && CommonUtils.isValidValue(this.requestTypeField.value);
  }

  loadFinalLicencesByCriteria(value: any): Observable<FinalExternalOfficeApprovalResult[]> {
    return this.service.licenseSearch({licenseNumber: value});
  }

  get basicTab(): UntypedFormGroup {
    return (this.form.get('basicInfo')) as UntypedFormGroup;
  }

  get externalOfficeNameField(): UntypedFormControl {
    return this.basicTab.get('externalOfficeName') as UntypedFormControl;
  }

  get requestTypeField(): UntypedFormControl {
    return (this.form.get('basicInfo')?.get('requestType')) as UntypedFormControl;
  }

  get initialLicenseNumberField(): UntypedFormControl {
    return (this.form.get('basicInfo')?.get('initialLicenseNumber')) as UntypedFormControl;
  }

  get initialLicenseFullSerialField(): UntypedFormControl {
    return (this.form.get('basicInfo')?.get('initialLicenseFullSerial')) as UntypedFormControl;
  }

  get oldLicenseFullSerialField(): UntypedFormControl {
    return (this.form.get('basicInfo')?.get('oldLicenseFullSerial')) as UntypedFormControl;
  }

  get licenseNumberField(): UntypedFormControl {
    return (this.form.get('basicInfo')?.get('licenseNumber')) as UntypedFormControl;
  }

  get countryField(): UntypedFormControl {
    return (this.form.get('basicInfo')?.get('country')) as UntypedFormControl;
  }

  get regionField(): UntypedFormControl {
    return (this.form.get('basicInfo')?.get('region')) as UntypedFormControl;
  }

  get establishmentDateField(): UntypedFormControl {
    return (this.form.get('basicInfo')?.get('establishmentDate')) as UntypedFormControl;
  }

  get specialExplanationField(): UntypedFormControl {
    return (this.form.get('basicInfo')?.get('description')) as UntypedFormControl;
  }

  get licenseDurationTypeField(): UntypedFormControl {
    return (this.form.get('basicInfo')?.get('licenseDurationType')) as UntypedFormControl
  }

  get licenseDurationField(): UntypedFormControl {
    return (this.form.get('basicInfo')?.get('licenseDuration')) as UntypedFormControl
  }

  get officeTypeField(): UntypedFormControl {
    return (this.form.get('basicInfo')?.get('headQuarterType')) as UntypedFormControl
  }

  get countriesField(): UntypedFormControl {
    return (this.form.get('basicInfo')?.get('countries')) as UntypedFormControl
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

  isEditCountryAllowed(): boolean {
    if (!this.isNewRequestType()) {
      return false;
    }
    let isAllowed = !this.isExtendOrCancelRequestType();

    if (!this.model?.id || (!!this.model?.id && this.model.canCommit())) {
      return isAllowed;
    } else {
      return isAllowed && !this.readonly;
    }
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

  onTabChange($event: TabComponent) {
    if ($event.name === 'attachmentsTab') {
      this.loadAttachments = true;
    }
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
  
  public get isUpdateOrRenewCase() : boolean {
   return this.requestType$.value === AllRequestTypesEnum.RENEW ||
    this.requestType$.value === AllRequestTypesEnum.UPDATE
  }
  
}
