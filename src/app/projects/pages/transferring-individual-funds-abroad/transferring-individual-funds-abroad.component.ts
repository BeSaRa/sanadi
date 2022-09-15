import {AfterViewInit, ChangeDetectorRef, Component} from '@angular/core';
import {AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {SaveTypes} from '@app/enums/save-types';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {TransferringIndividualFundsAbroad} from '@app/models/transferring-individual-funds-abroad';
import {LangService} from '@app/services/lang.service';
import {TransferringIndividualFundsAbroadService} from '@services/transferring-individual-funds-abroad.service';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {LookupService} from '@services/lookup.service';
import {DialogService} from '@services/dialog.service';
import {ToastService} from '@services/toast.service';
import {LicenseService} from '@services/license.service';
import {CommonCaseStatus} from '@app/enums/common-case-status.enum';
import {OpenFrom} from '@app/enums/open-from.enum';
import {EmployeeService} from '@services/employee.service';
import {Lookup} from '@app/models/lookup';
import {DatepickerControlsMap, DatepickerOptionsMap} from '@app/types/types';
import {DateUtils} from '@helpers/date-utils';
import {FormManager} from '@app/models/form-manager';
import {CustomValidators} from '@app/validators/custom-validators';
import {TransferFundsExecutiveManagement} from '@app/models/transfer-funds-executive-management';
import {exhaustMap, filter, map, takeUntil, tap} from 'rxjs/operators';
import {TransfereeTypeEnum} from '@app/enums/transferee-type-enum';
import {AdminLookupTypeEnum} from '@app/enums/admin-lookup-type-enum';
import {AdminLookup} from '@app/models/admin-lookup';
import {TransferFundsCharityPurpose} from '@app/models/transfer-funds-charity-purpose';
import {AdminResult} from '@app/models/admin-result';
import {DacOchaNewService} from '@services/dac-ocha-new.service';
import {DomainTypes} from '@app/enums/domain-types';
import {SelectedLicenseInfo} from '@contracts/selected-license-info';
import {TransferringIndividualFundsAbroadRequestTypeEnum} from '@app/enums/transferring-individual-funds-abroad-request-type-enum';
import {CountryService} from '@services/country.service';
import {Country} from '@app/models/country';
import {InternalProjectLicenseResult} from '@app/models/internal-project-license-result';
import {SharedService} from '@services/shared.service';
import {ReceiverOrganization} from '@app/models/receiver-organization';
import {ReceiverPerson} from '@app/models/receiver-person';
import {ITransferFundsAbroadComponent} from '@contracts/i-transfer-funds-abroad-component';

@Component({
  selector: 'transferring-individual-funds-abroad',
  templateUrl: './transferring-individual-funds-abroad.component.html',
  styleUrls: ['./transferring-individual-funds-abroad.component.scss']
})
export class TransferringIndividualFundsAbroadComponent extends EServicesGenericComponent<TransferringIndividualFundsAbroad, TransferringIndividualFundsAbroadService> implements AfterViewInit, ITransferFundsAbroadComponent {
  form!: UntypedFormGroup;
  executiveManagementForm!: UntypedFormGroup;
  transferPurposeForm!: UntypedFormGroup;
  fm!: FormManager;
  requestTypes: Lookup[] = this.lookupService.listByCategory.TransferringIndividualRequestType
    .sort((a, b) => a.lookupKey - b.lookupKey);
  transfereeTypes: Lookup[] = this.lookupService.listByCategory.TransfereeType
    .sort((a, b) => a.lookupKey - b.lookupKey);
  nationalities: Lookup[] = this.lookupService.listByCategory.Nationality
    .sort((a, b) => a.lookupKey - b.lookupKey);
  headQuarterTypes: Lookup[] = this.lookupService.listByCategory.HeadQuarterType
    .sort((a, b) => a.lookupKey - b.lookupKey);
  countries: Country[] = [];
  currencies: Lookup[] = this.lookupService.listByCategory.Currency
    .sort((a, b) => a.lookupKey - b.lookupKey);
  transferMethods: Lookup[] = this.lookupService.listByCategory.TransferMethod
    .sort((a, b) => a.lookupKey - b.lookupKey);
  transferTypes: Lookup[] = this.lookupService.listByCategory.TransferType
    .sort((a, b) => a.lookupKey - b.lookupKey);
  projectTypes: Lookup[] = this.lookupService.listByCategory.InternalProjectType
    .sort((a, b) => a.lookupKey - b.lookupKey);
  domains: Lookup[] = this.lookupService.listByCategory.Domain
    .sort((a, b) => a.lookupKey - b.lookupKey);
  mainDacs: AdminLookup[] = [];
  mainOchas: AdminLookup[] = [];

  selectReceiverOrganizationDisplayedColumns = ['organizationArabicName', 'organizationEnglishName', 'establishmentDate', 'actions'];
  selectReceiverPersonDisplayedColumns = ['receiverNameLikePassport', 'receiverEnglishNameLikePassport', 'receiverIdentificationNumber', 'actions'];

  datepickerControlsMap: DatepickerControlsMap = {};
  datepickerOptionsMap: DatepickerOptionsMap = {
    establishmentDate: DateUtils.getDatepickerOptions({disablePeriod: 'future'})
  };

  isCancel!: boolean;
  isExternalUser!: boolean;
  selectedExecutives: TransferFundsExecutiveManagement[] = [];
  selectedExecutive!: TransferFundsExecutiveManagement | null;
  selectedExecutiveIndex!: number | null;
  executiveDisplayedColumns: string[] = ['localName', 'englishName', 'jobTitle', 'nationality', 'identificationNumber', 'actions'];
  selectedPurposes: TransferFundsCharityPurpose[] = [];
  selectedPurpose!: TransferFundsCharityPurpose | null;
  selectedPurposeIndex!: number | null;
  purposeDisplayedColumns: string[] = ['projectName', 'projectType', 'domain', 'totalCost', 'beneficiaryCountry', 'executionCountry', 'actions'];
  transfereeTypeChanged: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);
  requestTypeChanged: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);
  individualTransfereeTypeSelected: Subject<void> = new Subject<void>();
  externalOrganizationTransfereeTypeSelected: Subject<void> = new Subject<void>();
  noTransfereeTypeSelected: Subject<void> = new Subject<void>();
  isIndividualTransferee!: boolean;
  isExternalOrganizationTransferee!: boolean;
  isHumanitarian = true;
  isDevelopment = true;
  addExecutiveFormActive!: boolean;
  addPurposeFormActive!: boolean;
  private displayedColumns: string[] = ['fullSerial', 'status', 'requestTypeInfo', 'actions'];
  selectedLicenses: TransferringIndividualFundsAbroad[] = [];
  selectedLicenseDisplayedColumns: string[] = ['serial', 'requestType', 'licenseStatus', 'actions'];
  hasSearchedForLicense = false;

  constructor(public lang: LangService,
              public fb: UntypedFormBuilder,
              private cd: ChangeDetectorRef,
              public service: TransferringIndividualFundsAbroadService,
              private lookupService: LookupService,
              private dialog: DialogService,
              private toast: ToastService,
              private licenseService: LicenseService,
              private employeeService: EmployeeService,
              private dacOchaNewService: DacOchaNewService,
              private countryService: CountryService,
              private sharedService: SharedService) {
    super();
  }

  get basicInfo(): UntypedFormGroup {
    return this.form.get('basicInfo')! as UntypedFormGroup;
  }

  get requestType(): UntypedFormControl {
    return this.form.get('basicInfo.requestType')! as UntypedFormControl;
  }

  get transfereeType(): UntypedFormControl {
    return this.form.get('basicInfo.transfereeType')! as UntypedFormControl;
  }

  get oldLicenseFullSerialField(): AbstractControl {
    return this.form.get('basicInfo.oldLicenseFullSerial')!;
  }

  get requesterInfo(): UntypedFormGroup {
    return this.form.get('requesterInfo')! as UntypedFormGroup;
  }

  get receiverOrganizationInfo(): UntypedFormGroup {
    return this.form.get('receiverOrganizationInfo')! as UntypedFormGroup;
  }

  get receiverPersonInfo(): UntypedFormGroup {
    return this.form.get('receiverPersonInfo')! as UntypedFormGroup;
  }

  get financialTransactionInfo(): UntypedFormGroup {
    return this.form.get('financialTransactionInfo')! as UntypedFormGroup;
  }

  get specialExplanation(): UntypedFormGroup {
    return this.form.get('explanation')! as UntypedFormGroup;
  }

  get executiveManagement(): UntypedFormGroup {
    return this.executiveManagementForm! as UntypedFormGroup;
  }

  get transferPurpose(): UntypedFormGroup {
    return this.transferPurposeForm! as UntypedFormGroup;
  }

  // receiver organization fields
  get organizationArabicName(): UntypedFormControl {
    return this.form.get('receiverOrganizationInfo.organizationArabicName')! as UntypedFormControl;
  }

  get organizationEnglishName(): UntypedFormControl {
    return this.form.get('receiverOrganizationInfo.organizationEnglishName')! as UntypedFormControl;
  }

  get headQuarterType(): UntypedFormControl {
    return this.form.get('receiverOrganizationInfo.headQuarterType')! as UntypedFormControl;
  }

  get establishmentDate(): UntypedFormControl {
    return this.form.get('receiverOrganizationInfo.establishmentDate')! as UntypedFormControl;
  }

  get country(): UntypedFormControl {
    return this.form.get('receiverOrganizationInfo.country')! as UntypedFormControl;
  }

  get region(): UntypedFormControl {
    return this.form.get('receiverOrganizationInfo.region')! as UntypedFormControl;
  }

  get city(): UntypedFormControl {
    return this.form.get('receiverOrganizationInfo.city')! as UntypedFormControl;
  }

  get detailsAddress(): UntypedFormControl {
    return this.form.get('receiverOrganizationInfo.detailsAddress')! as UntypedFormControl;
  }

  get postalCode(): UntypedFormControl {
    return this.form.get('receiverOrganizationInfo.postalCode')! as UntypedFormControl;
  }

  get website(): UntypedFormControl {
    return this.form.get('receiverOrganizationInfo.website')! as UntypedFormControl;
  }

  get organizationEmail(): UntypedFormControl {
    return this.form.get('receiverOrganizationInfo.organizationEmail')! as UntypedFormControl;
  }

  get firstSocialMedia(): UntypedFormControl {
    return this.form.get('receiverOrganizationInfo.firstSocialMedia')! as UntypedFormControl;
  }

  get secondSocialMedia(): UntypedFormControl {
    return this.form.get('receiverOrganizationInfo.secondSocialMedia')! as UntypedFormControl;
  }

  get thirdSocialMedia(): UntypedFormControl {
    return this.form.get('receiverOrganizationInfo.thirdSocialMedia')! as UntypedFormControl;
  }

  get receiverNameLikePassport(): UntypedFormControl {
    return this.form.get('receiverPersonInfo.receiverNameLikePassport')! as UntypedFormControl;
  }

  get receiverEnglishNameLikePassport(): UntypedFormControl {
    return this.form.get('receiverPersonInfo.receiverEnglishNameLikePassport')! as UntypedFormControl;
  }

  get receiverJobTitle(): UntypedFormControl {
    return this.form.get('receiverPersonInfo.receiverJobTitle')! as UntypedFormControl;
  }

  get receiverNationality(): UntypedFormControl {
    return this.form.get('receiverPersonInfo.receiverNationality')! as UntypedFormControl;
  }

  get receiverIdentificationNumber(): UntypedFormControl {
    return this.form.get('receiverPersonInfo.receiverIdentificationNumber')! as UntypedFormControl;
  }

  get receiverPassportNumber(): UntypedFormControl {
    return this.form.get('receiverPersonInfo.receiverPassportNumber')! as UntypedFormControl;
  }

  get receiverPhone1(): UntypedFormControl {
    return this.form.get('receiverPersonInfo.receiverPhone1')! as UntypedFormControl;
  }

  get receiverPhone2(): UntypedFormControl {
    return this.form.get('receiverPersonInfo.receiverPhone2')! as UntypedFormControl;
  }

  get domain(): UntypedFormControl {
    return this.transferPurposeForm.get('domain')! as UntypedFormControl;
  }

  get mainDACCategory(): UntypedFormControl {
    return this.transferPurposeForm.get('mainDACCategory')! as UntypedFormControl;
  }

  get mainUNOCHACategory(): UntypedFormControl {
    return this.transferPurposeForm.get('mainUNOCHACategory')! as UntypedFormControl;
  }

  ngAfterViewInit(): void {
    this.cd.detectChanges();
  }

  _initComponent(): void {
    this.loadCountries();
    this.isExternalUser = this.employeeService.isExternalUser();
    this.buildExecutiveManagementForm();
    this.buildTransferPurposeForm();
    this.listenToDomainChanges();
  }

  _buildForm(): void {
    const model = new TransferringIndividualFundsAbroad();
    this.form = this.fb.group({
      basicInfo: this.fb.group(model.buildBasicInfo(true)),
      requesterInfo: this.fb.group(model.buildRequesterInfo(true)),
      receiverOrganizationInfo: this.fb.group(model.buildRequiredReceiverOrganizationInfo(true)),
      receiverPersonInfo: this.fb.group(model.buildRequiredReceiverPersonInfo(true)),
      financialTransactionInfo: this.fb.group(model.buildFinancialTransactionInfo(true)),
      explanation: this.fb.group(model.buildExplanation(true))
    });

    this._buildDatepickerControlsMap();
    this.fm = new FormManager(this.form, this.lang);
  }

  _afterBuildForm(): void {
    this.listenToExternalOrganizationTransfereeTypeSelected();
    this.listenToIndividualTransfereeTypeSelected();
    this.listenToNoTransfereeTypeSelected();
    this.listenToTransfereeSubject();
    this.listenToTransfereeTypeChange();
    this.listenToRequestTypeSubject();
    this.listenToRequestTypeChange();
    this.handleReadonly();
  }

  _updateForm(model: TransferringIndividualFundsAbroad | undefined): void {
    if (!model) {
      return;
    }

    this.model = new TransferringIndividualFundsAbroad().clone({...this.model, ...model});
    this.form.patchValue({
      basicInfo: this.model?.buildBasicInfo(),
      requesterInfo: this.model?.buildRequesterInfo(),
      receiverOrganizationInfo: this.model?.buildRequiredReceiverOrganizationInfo(),
      receiverPersonInfo: this.model?.buildRequiredReceiverPersonInfo(),
      financialTransactionInfo: this.model?.buildFinancialTransactionInfo(),
      explanation: this.model?.buildExplanation()
    });

    this.selectedExecutives = this.model?.executiveManagementList;
    this.selectedPurposes = this.model?.charityPurposeTransferList;
    this.transfereeTypeChanged.next(this.transfereeType.value);
    this.requestTypeChanged.next(this.requestType.value);

    if(this.requestType.value !== TransferringIndividualFundsAbroadRequestTypeEnum.NEW && this.model?.oldLicenseId) {
      this.licenseService.validateLicenseByRequestType(this.model?.caseType, this.model!.requestType, this.model.oldLicenseId)
        .pipe(map(validated => {
          return (validated ? {
            selected: validated,
            details: validated
          } : null) as (null | SelectedLicenseInfo<TransferringIndividualFundsAbroad, TransferringIndividualFundsAbroad>);
        })).subscribe(ret => {
        this.selectedLicenses = [ret?.details!];
        this.hasSearchedForLicense = true;
      })
    }
  }

  _resetForm(): void {
    // this.requestType.patchValue(null);
    // this.transfereeType.patchValue(null, {emitEvent: false});
    // this.oldLicenseFullSerialField.patchValue(null);
    // this.requesterInfo.reset();
    // this.financialTransactionInfo.reset();
    // this.specialExplanation.reset();
    this.form.reset();
    this.hasSearchedForLicense = false;
    this.isIndividualTransferee = false;
    this.isExternalOrganizationTransferee = false;
  }

  _prepareModel(): TransferringIndividualFundsAbroad | Observable<TransferringIndividualFundsAbroad> {
    return new TransferringIndividualFundsAbroad().clone({
      ...this.model,
      ...this.basicInfo.getRawValue(),
      ...this.requesterInfo.getRawValue(),
      ...this.receiverOrganizationInfo.getRawValue(),
      ...this.receiverPersonInfo.getRawValue(),
      ...this.financialTransactionInfo.getRawValue(),
      ...this.specialExplanation.getRawValue(),
      executiveManagementList: this.selectedExecutives,
      charityPurposeTransferList: this.selectedPurposes
    });
  }

  _getNewInstance(): TransferringIndividualFundsAbroad {
    return new TransferringIndividualFundsAbroad();
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (this.isExternalOrganizationTransferee && this.selectedExecutives.length < 1 && !this.isCancel) {
      this.dialog.error(this.lang.map.you_should_add_at_least_one_person_to_executives_list);
    }

    if (this.selectedPurposes.length < 1 && !this.isCancel) {
      this.dialog.error(this.lang.map.you_should_add_at_least_one_purpose_in_purposes);
    }

    return this.form.valid;
  }

  _afterSave(model: TransferringIndividualFundsAbroad, saveType: SaveTypes, operation: OperationTypes): void {
    this.model = model;
    if (
      (operation === OperationTypes.CREATE && saveType === SaveTypes.FINAL) ||
      (operation === OperationTypes.UPDATE && saveType === SaveTypes.COMMIT)
    ) {
      this.dialog.success(this.lang.map.msg_request_has_been_added_successfully.change({serial: model.fullSerial}));
    } else {
      this.toast.success(this.lang.map.request_has_been_saved_successfully);
    }
  }

  _saveFail(error: any): void {

  }

  _beforeLaunch(): boolean | Observable<boolean> {
    return this.form.valid;
  }

  _afterLaunch(): void {
    this._resetForm();
    this.selectedExecutives = [];
    this.selectedPurposes = [];
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }

  _launchFail(error: any): void {

  }

  _destroyComponent(): void {

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
    }
  }

  private validateSingleLicense(license: TransferringIndividualFundsAbroad): Observable<null | SelectedLicenseInfo<TransferringIndividualFundsAbroad, TransferringIndividualFundsAbroad>> {
    return this.licenseService.validateLicenseByRequestType<TransferringIndividualFundsAbroad>(this.model!.caseType, this.model!.requestType, license.id)
      .pipe(map(validated => {
        return (validated ? {
          selected: validated,
          details: validated
        } : null) as (null | SelectedLicenseInfo<TransferringIndividualFundsAbroad, TransferringIndividualFundsAbroad>);
      }));
  }

  private openSelectLicense(licenses: TransferringIndividualFundsAbroad[]) {
    return this.licenseService.openSelectLicenseDialog(licenses, this.model, true, this.displayedColumns).onAfterClose$ as Observable<{ selected: TransferringIndividualFundsAbroad, details: TransferringIndividualFundsAbroad }>;
  }

  searchForLicense() {
    this.licenseService
      .transferringIndividualFundsAbroadSearch<TransferringIndividualFundsAbroad>({fullSerial: this.oldLicenseFullSerialField.value})
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(licenses => !licenses.length && this.dialog.info(this.lang.map.no_result_for_your_search_criteria)))
      .pipe(filter(licenses => !!licenses.length))
      .pipe(exhaustMap((licenses) => {
        return licenses.length === 1 ? this.validateSingleLicense(licenses[0]) : this.openSelectLicense(licenses);
      }))
      .pipe(
        filter<null | SelectedLicenseInfo<TransferringIndividualFundsAbroad, TransferringIndividualFundsAbroad>, SelectedLicenseInfo<TransferringIndividualFundsAbroad, TransferringIndividualFundsAbroad>>
        ((info): info is SelectedLicenseInfo<TransferringIndividualFundsAbroad, TransferringIndividualFundsAbroad> => !!info))
      .subscribe((_info) => {
        // set oldLicenseId property from validated object id
        _info.details.oldLicenseId = _info.details.id;

        // delete id property
        let tempObj = _info.details as any;
        delete tempObj.id;
        _info.details = new TransferringIndividualFundsAbroad().clone(tempObj);

        this.hasSearchedForLicense = true;
        this.selectedLicenses = [_info.details];
        _info.details.requestType = this.model?.requestType!;
        this._updateForm(_info.details);
        this.oldLicenseFullSerialField.patchValue(_info.details.fullSerial);
      });
  }

  viewSelectedLicense(): void {
    let license = {
      documentTitle: this.selectedLicenses[0].fullSerial,
      id: this.selectedLicenses[0].id
    } as InternalProjectLicenseResult;
    this.licenseService.showLicenseContent(license, this.selectedLicenses[0].getCaseType())
      .subscribe((file) => {
        this.sharedService.openViewContentDialog(file, license);
      });
  }

  private _buildDatepickerControlsMap() {
    this.datepickerControlsMap = {
      establishmentDate: this.establishmentDate
    };
  }

  buildExecutiveManagementForm(): void {
    this.executiveManagementForm = this.fb.group({
      nameLikePassport: [null, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]],
      englishNameLikePassport: [null, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]],
      jobTitle: [null, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]],
      executiveNationality: [null, [CustomValidators.required]],
      executiveIdentificationNumber: [null, [CustomValidators.required, CustomValidators.maxLength(20)]],
      passportNumber: [null, [CustomValidators.required, ...CustomValidators.commonValidations.passport]],
      executivephone1: [null, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)],
      executivephone2: [null, CustomValidators.commonValidations.phone]
    });
  }

  buildTransferPurposeForm(): void {
    this.transferPurposeForm = this.fb.group({
      projectName: [null, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]],
      projectType: [null, [CustomValidators.required]],
      domain: [null, [CustomValidators.required]],
      mainUNOCHACategory: [null, []],
      mainDACCategory: [null, []],
      beneficiaryCountry: [null, [CustomValidators.required]],
      executionCountry: [null, [CustomValidators.required]],
      totalCost: [null, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(20)]],
      projectImplementationPeriod: [null, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(2)]]
    });
  }

  listenToTransfereeTypeChange() {
    this.transfereeType.valueChanges.subscribe(value => {
      this.transfereeTypeChanged.next(value);
    });
  }

  listenToTransfereeSubject() {
    this.transfereeTypeChanged
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        if (value === TransfereeTypeEnum.INDIVIDUAL) {
          this.individualTransfereeTypeSelected.next();
        } else if (value === TransfereeTypeEnum.EXTERNAL_ORGANIZATION) {
          this.externalOrganizationTransfereeTypeSelected.next();
        } else {
          this.noTransfereeTypeSelected.next();
        }
      });
  }

  listenToRequestTypeChange() {
    this.requestType.valueChanges.subscribe(value => {
      this.requestTypeChanged.next(value);
    });
  }

  listenToRequestTypeSubject() {
    this.requestTypeChanged
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        if (value) {
          this.model!.requestType = value;
        }
        if (!value || value === TransferringIndividualFundsAbroadRequestTypeEnum.NEW) {
          this.enableAllFormsInCaseOfNotCancelRequest();
          this.disableSearchField();
          this.isCancel = false;
        } else if (value === TransferringIndividualFundsAbroadRequestTypeEnum.UPDATE) {
          this.enableAllFormsInCaseOfNotCancelRequest();
          this.enableSearchField();
          this.isCancel = false;
        } else {
          this.disableAllFormsInCaseOfCancelRequest();
          this.enableSearchField();
          this.isCancel = true;
        }
      });
  }

  disableAllFormsInCaseOfCancelRequest() {
    // this.transfereeType.patchValue(null);
    this.transfereeType.disable();

    // this.requesterInfo.reset();
    this.requesterInfo.disable();
    this.requesterInfo.updateValueAndValidity();

    // this.receiverPersonInfo.reset();
    this.receiverPersonInfo.disable();
    this.receiverPersonInfo.updateValueAndValidity();

    // this.receiverOrganizationInfo.reset();
    this.receiverOrganizationInfo.disable();
    this.receiverOrganizationInfo.updateValueAndValidity();

    // this.financialTransactionInfo.reset();
    this.financialTransactionInfo.disable();
    this.financialTransactionInfo.updateValueAndValidity();

    // this.specialExplanation.reset();
    this.specialExplanation.disable();
    this.specialExplanation.updateValueAndValidity();

    // this.transferPurposeForm.reset();
    this.transferPurposeForm.disable();
    this.transferPurposeForm.updateValueAndValidity();

    // this.executiveManagementForm.reset();
    this.executiveManagementForm.disable();
    this.executiveManagementForm.updateValueAndValidity();

    // this.transferPurposeForm.reset();
    this.transferPurposeForm.disable();
    this.transferPurposeForm.updateValueAndValidity();

    // this.selectedPurposes = [];
    // this.selectedExecutives = [];
    // this.selectedLicenses = [];

    this.form.updateValueAndValidity();
  }

  enableAllFormsInCaseOfNotCancelRequest() {
    this.transfereeType.enable();
    this.requesterInfo.enable();
    this.receiverPersonInfo.enable();
    this.receiverOrganizationInfo.enable();
    this.financialTransactionInfo.enable();
    this.specialExplanation.enable();
    this.transferPurposeForm.enable();
    this.executiveManagementForm.enable();
    this.transferPurposeForm.enable();

    this.form.updateValueAndValidity();
  }

  listenToIndividualTransfereeTypeSelected() {
    this.individualTransfereeTypeSelected
      .pipe(takeUntil(this.destroy$))
      .subscribe(_ => {
        if (!this.isIndividualTransferee) {
          this.isIndividualTransferee = true;
        }
        if (this.isExternalOrganizationTransferee) {
          this.isExternalOrganizationTransferee = false;
        }
        this.dontRequireReceiverOrganizationInfoFields();
        this.requireReceiverPersonInfoFields();
        this.selectedExecutives = [];
      });
  }

  listenToExternalOrganizationTransfereeTypeSelected() {
    this.externalOrganizationTransfereeTypeSelected
      .pipe(takeUntil(this.destroy$))
      .subscribe(_ => {
        if (this.isIndividualTransferee) {
          this.isIndividualTransferee = false;
        }
        if (!this.isExternalOrganizationTransferee) {
          this.isExternalOrganizationTransferee = true;
        }
        this.requireReceiverOrganizationInfoFields();
        this.dontRequireReceiverPersonInfoFields();
      });
  }

  listenToNoTransfereeTypeSelected() {
    this.noTransfereeTypeSelected
      .pipe(takeUntil(this.destroy$))
      .subscribe(_ => {
        this.isIndividualTransferee = false;
        this.isExternalOrganizationTransferee = false;
      });
  }

  requireReceiverOrganizationInfoFields() {
    this.organizationArabicName.setValidators([CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('AR_NUM')]);
    this.organizationEnglishName.setValidators([CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')]);
    this.headQuarterType.setValidators([CustomValidators.required]);
    this.establishmentDate.setValidators([CustomValidators.required]);
    this.country.setValidators([CustomValidators.required]);
    this.region.setValidators([CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]);
    this.city.setValidators([CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]);
    this.detailsAddress.setValidators([CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]);
    this.postalCode.setValidators([CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(15)]);
    this.website.setValidators([CustomValidators.required, CustomValidators.maxLength(350)]);
    this.organizationEmail.setValidators([CustomValidators.required, Validators.email, CustomValidators.maxLength(CustomValidators.defaultLengths.EMAIL_MAX)]);
    this.firstSocialMedia.setValidators([CustomValidators.maxLength(350)]);
    this.secondSocialMedia.setValidators([CustomValidators.maxLength(350)]);
    this.thirdSocialMedia.setValidators([CustomValidators.maxLength(350)]);
  }

  dontRequireReceiverOrganizationInfoFields() {
    this.organizationArabicName.setValidators([CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('AR_NUM')]);
    this.organizationEnglishName.setValidators([CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')]);
    this.headQuarterType.setValidators([]);
    this.establishmentDate.setValidators([]);
    this.country.setValidators([]);
    this.region.setValidators([CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]);
    this.city.setValidators([CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]);
    this.detailsAddress.setValidators([CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]);
    this.postalCode.setValidators([CustomValidators.number, CustomValidators.maxLength(15)]);
    this.website.setValidators([CustomValidators.maxLength(350)]);
    this.organizationEmail.setValidators([Validators.email, CustomValidators.maxLength(CustomValidators.defaultLengths.EMAIL_MAX)]);
    this.firstSocialMedia.setValidators([CustomValidators.maxLength(350)]);
    this.secondSocialMedia.setValidators([CustomValidators.maxLength(350)]);
    this.thirdSocialMedia.setValidators([CustomValidators.maxLength(350)]);
    this.organizationArabicName.patchValue(null);
    this.organizationEnglishName.patchValue(null);
    this.headQuarterType.patchValue(null);
    this.establishmentDate.patchValue(null);
    this.country.patchValue(null);
    this.region.patchValue(null);
    this.city.patchValue(null);
    this.detailsAddress.patchValue(null);
    this.postalCode.patchValue(null);
    this.website.patchValue(null);
    this.organizationEmail.patchValue(null);
    this.firstSocialMedia.patchValue(null);
    this.secondSocialMedia.patchValue(null);
    this.thirdSocialMedia.patchValue(null);
  }

  requireReceiverPersonInfoFields() {
    this.receiverNameLikePassport.setValidators([CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]);
    this.receiverEnglishNameLikePassport.setValidators([CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')]);
    this.receiverJobTitle.setValidators([CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]);
    this.receiverNationality.setValidators([CustomValidators.required]);
    this.receiverIdentificationNumber.setValidators([CustomValidators.required, CustomValidators.maxLength(20)]);
    this.receiverPassportNumber.setValidators([CustomValidators.required, ...CustomValidators.commonValidations.passport]);
    this.receiverPhone1.setValidators([CustomValidators.required].concat(CustomValidators.commonValidations.phone));
    this.receiverPhone2.setValidators(CustomValidators.commonValidations.phone);
  }

  dontRequireReceiverPersonInfoFields() {
    this.receiverNameLikePassport.setValidators([CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]);
    this.receiverEnglishNameLikePassport.setValidators([CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')]);
    this.receiverJobTitle.setValidators([CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]);
    this.receiverNationality.setValidators([]);
    this.receiverIdentificationNumber.setValidators([CustomValidators.maxLength(20)]);
    this.receiverPassportNumber.setValidators([...CustomValidators.commonValidations.passport]);
    this.receiverPhone1.setValidators(CustomValidators.commonValidations.phone);
    this.receiverPhone2.setValidators(CustomValidators.commonValidations.phone);
    this.receiverNameLikePassport.patchValue(null);
    this.receiverEnglishNameLikePassport.patchValue(null);
    this.receiverJobTitle.patchValue(null);
    this.receiverNationality.patchValue(null);
    this.receiverIdentificationNumber.patchValue(null);
    this.receiverPassportNumber.patchValue(null);
    this.receiverPhone1.patchValue(null);
    this.receiverPhone2.patchValue(null);
  }

  loadDacs() {
    this.dacOchaNewService.loadByType(AdminLookupTypeEnum.DAC).subscribe(list => {
      this.mainDacs = list;
    });
  }

  loadOchas() {
    this.dacOchaNewService.loadByType(AdminLookupTypeEnum.OCHA).subscribe(list => {
      this.mainOchas = list;
    });
  }

  loadCountries() {
    this.countryService.loadAsLookups().subscribe((list: Country[]) => {
      this.countries = list;
    });
  }

  listenToDomainChanges() {
    this.domain.valueChanges.subscribe(val => {
      if (val === DomainTypes.HUMANITARIAN) {
        this.showAndRequireMainUNOCHACategory();
        this.hideAndDontRequireMainDACCategory();
        this.loadOchas();
      } else if (val === DomainTypes.DEVELOPMENT) {
        this.hideAndDontRequireMainUNOCHACategory();
        this.showAndRequireMainDACCategory();
        this.loadDacs();
      } else {
        this.showAndDontRequireMainUNOCHACategory();
        this.showAndDontRequireMainDACCategory();
      }
    });
  }

  showAndRequireMainDACCategory() {
    this.mainDACCategory.setValidators([CustomValidators.required]);
    this.mainDACCategory.updateValueAndValidity();
    this.isDevelopment = true;
  }

  showAndRequireMainUNOCHACategory() {
    this.mainUNOCHACategory.setValidators([CustomValidators.required]);
    this.mainUNOCHACategory.updateValueAndValidity();
    this.isHumanitarian = true;
  }

  hideAndDontRequireMainDACCategory() {
    this.mainDACCategory.patchValue(null);
    this.mainDACCategory.setValidators([]);
    this.mainDACCategory.updateValueAndValidity();
    this.isDevelopment = false;
  }

  hideAndDontRequireMainUNOCHACategory() {
    this.mainUNOCHACategory.patchValue(null);
    this.mainUNOCHACategory.setValidators([]);
    this.mainUNOCHACategory.updateValueAndValidity();
    this.isHumanitarian = false;
  }

  showAndDontRequireMainDACCategory() {
    this.mainDACCategory.setValidators([]);
    this.mainDACCategory.updateValueAndValidity();
    this.isDevelopment = true;
  }

  showAndDontRequireMainUNOCHACategory() {
    this.mainUNOCHACategory.setValidators([]);
    this.mainUNOCHACategory.updateValueAndValidity();
    this.isHumanitarian = true;
  }

  // add/edit executive functionality
  openAddExecutiveForm() {
    this.addExecutiveFormActive = true;
  }

  selectExecutive(event: MouseEvent, model: TransferFundsExecutiveManagement) {
    this.addExecutiveFormActive = true;
    event.preventDefault();
    this.selectedExecutive = model;
    this.executiveManagementForm.patchValue(this.selectedExecutive!);
    this.selectedExecutiveIndex = this.selectedExecutives
      .map(x => x.executiveIdentificationNumber).indexOf(model.executiveIdentificationNumber);
  }

  saveExecutive() {
    const executive = new TransferFundsExecutiveManagement().clone(this.executiveManagementForm.getRawValue() as TransferFundsExecutiveManagement);
    if (!this.selectedExecutive) {
      if (!this.isExistExecutiveInCaseOfAdd(this.selectedExecutives, executive)) {
        this.selectedExecutives = this.selectedExecutives.concat(executive);
        this.resetExecutiveForm();
        this.addExecutiveFormActive = false;
      } else {
        this.dialog.error(this.lang.map.selected_item_already_exists);
      }
    } else {
      if (!this.isExistExecutiveInCaseOfEdit(this.selectedExecutives, executive, this.selectedExecutiveIndex!)) {
        // this.selectedExecutives.splice(this.selectedExecutiveIndex!, 1);
        let newList = this.selectedExecutives.slice();
        newList.splice(this.selectedExecutiveIndex!, 1);
        newList.splice(this.selectedExecutiveIndex!, 0, executive);
        this.selectedExecutives = newList;
        this.resetExecutiveForm();
        this.addExecutiveFormActive = false;
      } else {
        this.dialog.error(this.lang.map.selected_item_already_exists);
      }
    }
  }

  cancelAddExecutive() {
    this.resetExecutiveForm();
    this.addExecutiveFormActive = false;
  }

  isExistExecutiveInCaseOfAdd(selectedExecutives: TransferFundsExecutiveManagement[], toBeAddedExecutive: TransferFundsExecutiveManagement): boolean {
    return selectedExecutives.some(x => x.executiveIdentificationNumber === toBeAddedExecutive.executiveIdentificationNumber);
  }

  isExistExecutiveInCaseOfEdit(selectedExecutives: TransferFundsExecutiveManagement[], toBeEditedExecutive: TransferFundsExecutiveManagement, selectedIndex: number): boolean {
    for (let i = 0; i < selectedExecutives.length; i++) {
      if (i === selectedIndex) {
        continue;
      }

      if (selectedExecutives[i].executiveIdentificationNumber === toBeEditedExecutive.executiveIdentificationNumber) {
        return true;
      }
    }
    return false;
  }

  resetExecutiveForm() {
    this.selectedExecutive = null;
    this.selectedExecutiveIndex = null;
    this.executiveManagementForm.reset();
  }

  removeExecutive(event: MouseEvent, model: TransferFundsExecutiveManagement) {
    event.preventDefault();
    this.selectedExecutives = this.selectedExecutives.filter(x => x.executiveIdentificationNumber != model.executiveIdentificationNumber);
    this.resetExecutiveForm();
  }

  // add/edit purpose functionality
  openAddPurposeForm() {
    this.addPurposeFormActive = true;
  }

  selectPurpose(event: MouseEvent, model: TransferFundsCharityPurpose) {
    event.preventDefault();
    model = new TransferFundsCharityPurpose().clone(model);
    this.addPurposeFormActive = true;
    this.selectedPurpose = model;
    this.transferPurposeForm.patchValue(this.selectedPurpose!);
    this.selectedPurposeIndex = this.getSelectedPurposeIndex(this.selectedPurposes, model);
  }

  getSelectedPurposeIndex(purposes: TransferFundsCharityPurpose[], purpose: TransferFundsCharityPurpose): number | null {
    for (let i = 0; i < purposes.length; i++) {
      if (purposes[i].isEqual(purpose)) {
        return i;
      }
    }

    return null;
  }

  savePurpose() {
    const purpose = this.setPurposeInfoProperties(new TransferFundsCharityPurpose().clone(this.transferPurposeForm.getRawValue() as TransferFundsCharityPurpose));
    if (!this.selectedPurpose) {
      if (!this.isExistPurposeInCaseOfAdd(this.selectedPurposes, purpose)) {
        this.selectedPurposes = this.selectedPurposes.concat(purpose);
        this.resetPurposeForm();
        this.addPurposeFormActive = false;
      } else {
        this.dialog.error(this.lang.map.selected_item_already_exists);
      }
    } else {
      if (!this.isExistPurposeInCaseOfEdit(this.selectedPurposes, purpose, this.selectedPurposeIndex!)) {
        // this.selectedPurposes.splice(this.selectedPurposeIndex!, 1);
        let newList = this.selectedPurposes.slice();
        newList.splice(this.selectedPurposeIndex!, 1);
        newList.splice(this.selectedPurposeIndex!, 0, purpose);
        this.selectedPurposes = newList;
        this.resetPurposeForm();
        this.addPurposeFormActive = false;
      } else {
        this.dialog.error(this.lang.map.selected_item_already_exists);
      }
    }
  }

  setPurposeInfoProperties(purpose: TransferFundsCharityPurpose): TransferFundsCharityPurpose {
    purpose.projectTypeInfo = AdminResult.createInstance(this.projectTypes.find(x => x.lookupKey == purpose.projectType)!);
    purpose.domainInfo = AdminResult.createInstance(this.domains.find(x => x.lookupKey == purpose.domain)!);
    purpose.mainUNOCHACategoryInfo = AdminResult.createInstance(this.mainOchas.find(x => x.id == purpose.mainUNOCHACategory)!);
    purpose.mainDACCategoryInfo = AdminResult.createInstance(this.mainDacs.find(x => x.id == purpose.mainDACCategory)!);
    purpose.beneficiaryCountryInfo = AdminResult.createInstance(this.countries.find(x => x.id == purpose.beneficiaryCountry)!);
    purpose.executionCountryInfo = AdminResult.createInstance(this.countries.find(x => x.id == purpose.executionCountry)!);

    return purpose;
  }

  cancelAddPurpose() {
    this.resetPurposeForm();
    this.addPurposeFormActive = false;
  }

  isExistPurposeInCaseOfAdd(selectedPurposes: TransferFundsCharityPurpose[], toBeAddedPurpose: TransferFundsCharityPurpose): boolean {
    return selectedPurposes.some(x =>
      x.isEqual(toBeAddedPurpose)
    );
  }

  isExistPurposeInCaseOfEdit(selectedPurposes: TransferFundsCharityPurpose[], toBeEditedPurpose: TransferFundsCharityPurpose, selectedIndex: number): boolean {
    for (let i = 0; i < selectedPurposes.length; i++) {
      if (i === selectedIndex) {
        continue;
      }

      if (selectedPurposes[i].isEqual(toBeEditedPurpose)) {
        return true;
      }
    }
    return false;
  }

  resetPurposeForm() {
    this.selectedPurpose = null;
    this.selectedPurposeIndex = null;
    this.transferPurposeForm.reset();
  }

  removePurpose(event: MouseEvent, model: TransferFundsCharityPurpose) {
    event.preventDefault();
    this.selectedPurposes = this.selectedPurposes.filter(x => x.isNotEqual(model));
    this.resetPurposeForm();
  }

  enableSearchField() {
    this.oldLicenseFullSerialField.enable();
    this.setOldLicenseFullSerialRequired();
  }

  disableSearchField() {
    this.oldLicenseFullSerialField.patchValue(null);
    this.oldLicenseFullSerialField.disable();
    this.oldLicenseFullSerialField.setValidators([]);
    this.oldLicenseFullSerialField.updateValueAndValidity();
  }

  setOldLicenseFullSerialRequired() {
    this.oldLicenseFullSerialField.setValidators([CustomValidators.required, CustomValidators.maxLength(50)]);
    this.oldLicenseFullSerialField.updateValueAndValidity();
  }

  private openSelectOrganization(items: ReceiverOrganization[]) {
    return this.service.openSelectReceiverOrganizationDialog(items, this.selectReceiverOrganizationDisplayedColumns).onAfterClose$ as Observable<ReceiverOrganization>;
  }

  searchOrganizations(nameLang: string) {
    const criteria = nameLang === 'en' ? {
      englishName: this.organizationEnglishName.value === '' ? null : this.organizationEnglishName.value
    } : {
      arabicName: this.organizationArabicName.value === '' ? null : this.organizationArabicName.value
    };

    this.service.searchReceiverOrganizations(criteria)
      .pipe(tap(items => !items.length && this.dialog.info(this.lang.map.no_result_for_your_search_criteria)))
      .pipe(filter(members => !!members.length))
      .pipe(map(items => {
        return items.map(item => {
          item.establishmentDate = DateUtils.changeDateToDatepicker(item.establishmentDate);
          return item;
        });
      }))
      .pipe(exhaustMap((items) => {
        return items.length === 1 ? of(items[0]) : this.openSelectOrganization(items);
      }))
      .subscribe((item) => {
        this.model!.entityID = item.id;
        this.receiverOrganizationInfo.patchValue(item);
      });
  }

  private openSelectPerson(items: ReceiverPerson[]) {
    return this.service.openSelectReceiverPersonDialog(items, this.selectReceiverPersonDisplayedColumns).onAfterClose$ as Observable<ReceiverPerson>;
  }

  searchPersons(nameLang: string) {
    const criteria = nameLang === 'en' ? {
      englishName: this.receiverEnglishNameLikePassport.value === '' ? null : this.receiverEnglishNameLikePassport.value
    } : {
      localName: this.receiverNameLikePassport.value === '' ? null : this.receiverNameLikePassport.value
    };

    this.service.searchReceiverPersons(criteria)
      .pipe(tap(items => !items.length && this.dialog.info(this.lang.map.no_result_for_your_search_criteria)))
      .pipe(filter(items => !!items.length))
      .pipe(map(items => {
        return items.map(item => item);
      }))
      .pipe(exhaustMap((items) => {
        return items.length === 1 ? of(items[0]) : this.openSelectPerson(items);
      }))
      .subscribe((item) => {
        this.model!.entityID = item.id;
        this.receiverPersonInfo.patchValue(item);
      });
  }
}
