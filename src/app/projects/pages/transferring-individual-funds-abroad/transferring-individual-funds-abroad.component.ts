import {AfterViewInit, ChangeDetectorRef, Component} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {SaveTypes} from '@app/enums/save-types';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {TransferringIndividualFundsAbroad} from '@app/models/transferring-individual-funds-abroad';
import {LangService} from '@app/services/lang.service';
import {TransferringIndividualFundsAbroadService} from '@services/transferring-individual-funds-abroad.service';
import {Observable, Subject} from 'rxjs';
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
import {takeUntil} from 'rxjs/operators';
import {TransfereeTypeEnum} from '@app/enums/transferee-type-enum';
import {AdminLookupTypeEnum} from '@app/enums/admin-lookup-type-enum';
import {AdminLookup} from '@app/models/admin-lookup';
import {TransferFundsCharityPurpose} from '@app/models/transfer-funds-charity-purpose';
import {AdminResult} from '@app/models/admin-result';
import {DacOchaNewService} from '@services/dac-ocha-new.service';
import {DomainTypes} from '@app/enums/domain-types';

@Component({
  selector: 'transferring-individual-funds-abroad',
  templateUrl: './transferring-individual-funds-abroad.component.html',
  styleUrls: ['./transferring-individual-funds-abroad.component.scss']
})
export class TransferringIndividualFundsAbroadComponent extends EServicesGenericComponent<TransferringIndividualFundsAbroad, TransferringIndividualFundsAbroadService> implements AfterViewInit {
  form!: FormGroup;
  executiveManagementForm!: FormGroup;
  transferPurposeForm!: FormGroup;
  fm!: FormManager;
  requestTypes: Lookup[] = this.lookupService.listByCategory.TransferringIndividualRequestType
    .sort((a, b) => a.lookupKey - b.lookupKey);
  transfereeTypes: Lookup[] = this.lookupService.listByCategory.TransfereeType
    .sort((a, b) => a.lookupKey - b.lookupKey);
  nationalities: Lookup[] = this.lookupService.listByCategory.Nationality
    .sort((a, b) => a.lookupKey - b.lookupKey);
  headQuarterTypes: Lookup[] = this.lookupService.listByCategory.HeadQuarterType
    .sort((a, b) => a.lookupKey - b.lookupKey);
  countries: Lookup[] = this.lookupService.listByCategory.Countries
    .sort((a, b) => a.lookupKey - b.lookupKey);
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

  datepickerControlsMap: DatepickerControlsMap = {};
  datepickerOptionsMap: DatepickerOptionsMap = {
    establishmentDate: DateUtils.getDatepickerOptions({disablePeriod: 'future'})
  };

  isExternalUser!: boolean;
  selectedExecutives: TransferFundsExecutiveManagement[] = [];
  selectedExecutive!: TransferFundsExecutiveManagement | null;
  selectedExecutiveIndex!: number | null;
  executiveDisplayedColumns: string[] = ['localName', 'englishName', 'jobTitle', 'nationality', 'identificationNumber', 'actions'];
  selectedPurposes: TransferFundsCharityPurpose[] = [];
  selectedPurpose!: TransferFundsCharityPurpose | null;
  selectedPurposeIndex!: number | null;
  purposeDisplayedColumns: string[] = ['projectName', 'projectType', 'domain', 'totalCost', 'beneficiaryCountry', 'executionCountry', 'actions'];
  individualTransfereeTypeSelected: Subject<void> = new Subject<void>();
  externalOrganizationTransfereeTypeSelected: Subject<void> = new Subject<void>();
  noTransfereeTypeSelected: Subject<void> = new Subject<void>();
  isIndividualTransferee!: boolean;
  isExternalOrganizationTransferee!: boolean;
  isHumanitarian = true;
  isDevelopment = true;
  addExecutiveFormActive!: boolean;
  addPurposeFormActive!: boolean;

  constructor(public lang: LangService,
              public fb: FormBuilder,
              private cd: ChangeDetectorRef,
              public service: TransferringIndividualFundsAbroadService,
              private lookupService: LookupService,
              private dialog: DialogService,
              private toast: ToastService,
              private licenseService: LicenseService,
              private employeeService: EmployeeService,
              private dacOchaNewService: DacOchaNewService) {
    super();
  }

  get basicInfo(): FormGroup {
    return this.form.get('basicInfo')! as FormGroup;
  }

  get requesterInfo(): FormGroup {
    return this.form.get('requesterInfo')! as FormGroup;
  }

  get receiverOrganizationInfo(): FormGroup {
    return this.form.get('receiverOrganizationInfo')! as FormGroup;
  }

  get receiverPersonInfo(): FormGroup {
    return this.form.get('receiverPersonInfo')! as FormGroup;
  }

  get financialTransactionInfo(): FormGroup {
    return this.form.get('financialTransactionInfo')! as FormGroup;
  }

  get specialExplanation(): FormGroup {
    return this.form.get('explanation')! as FormGroup;
  }

  get transfereeType(): FormControl {
    return this.form.get('basicInfo.transfereeType')! as FormControl;
  }

  get executiveManagement(): FormGroup {
    return this.executiveManagementForm! as FormGroup;
  }

  get transferPurpose(): FormGroup {
    return this.transferPurposeForm! as FormGroup;
  }

  // receiver organization fields
  get organizationArabicName(): FormControl {
    return this.form.get('receiverOrganizationInfo.organizationArabicName')! as FormControl;
  }

  get organizationEnglishName(): FormControl {
    return this.form.get('receiverOrganizationInfo.organizationEnglishName')! as FormControl;
  }

  get headQuarterType(): FormControl {
    return this.form.get('receiverOrganizationInfo.headQuarterType')! as FormControl;
  }

  get establishmentDate(): FormControl {
    return this.form.get('receiverOrganizationInfo.establishmentDate')! as FormControl;
  }

  get country(): FormControl {
    return this.form.get('receiverOrganizationInfo.country')! as FormControl;
  }

  get region(): FormControl {
    return this.form.get('receiverOrganizationInfo.region')! as FormControl;
  }

  get city(): FormControl {
    return this.form.get('receiverOrganizationInfo.city')! as FormControl;
  }

  get detailsAddress(): FormControl {
    return this.form.get('receiverOrganizationInfo.detailsAddress')! as FormControl;
  }

  get postalCode(): FormControl {
    return this.form.get('receiverOrganizationInfo.postalCode')! as FormControl;
  }

  get website(): FormControl {
    return this.form.get('receiverOrganizationInfo.website')! as FormControl;
  }

  get organizationEmail(): FormControl {
    return this.form.get('receiverOrganizationInfo.organizationEmail')! as FormControl;
  }

  get firstSocialMedia(): FormControl {
    return this.form.get('receiverOrganizationInfo.firstSocialMedia')! as FormControl;
  }

  get secondSocialMedia(): FormControl {
    return this.form.get('receiverOrganizationInfo.secondSocialMedia')! as FormControl;
  }

  get thirdSocialMedia(): FormControl {
    return this.form.get('receiverOrganizationInfo.thirdSocialMedia')! as FormControl;
  }

  get receiverNameLikePassport(): FormControl {
    return this.form.get('receiverPersonInfo.receiverNameLikePassport')! as FormControl;
  }

  get receiverEnglishNameLikePassport(): FormControl {
    return this.form.get('receiverPersonInfo.receiverEnglishNameLikePassport')! as FormControl;
  }

  get receiverJobTitle(): FormControl {
    return this.form.get('receiverPersonInfo.receiverJobTitle')! as FormControl;
  }

  get receiverNationality(): FormControl {
    return this.form.get('receiverPersonInfo.receiverNationality')! as FormControl;
  }

  get receiverIdentificationNumber(): FormControl {
    return this.form.get('receiverPersonInfo.receiverIdentificationNumber')! as FormControl;
  }

  get receiverPassportNumber(): FormControl {
    return this.form.get('receiverPersonInfo.receiverPassportNumber')! as FormControl;
  }

  get receiverPhone1(): FormControl {
    return this.form.get('receiverPersonInfo.receiverPhone1')! as FormControl;
  }

  get receiverPhone2(): FormControl {
    return this.form.get('receiverPersonInfo.receiverPhone2')! as FormControl;
  }

  get domain(): FormControl {
    return this.transferPurposeForm.get('domain')! as FormControl;
  }

  get mainDACCategory(): FormControl {
    return this.transferPurposeForm.get('mainDACCategory')! as FormControl;
  }

  get mainUNOCHACategory(): FormControl {
    return this.transferPurposeForm.get('mainUNOCHACategory')! as FormControl;
  }

  ngAfterViewInit(): void {
    this.cd.detectChanges();
  }

  _initComponent(): void {
    // load initials here
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
    this.listenToTransfereeTypeChange();
    this.listenToIndividualTransfereeTypeSelected();
    this.listenToExternalOrganizationTransfereeTypeSelected();
    this.listenToNoTransfereeTypeSelected();
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
  }

  _resetForm(): void {
    this.form.reset();
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
    if(this.isExternalOrganizationTransferee && this.selectedExecutives.length < 1) {
      this.dialog.error(this.lang.map.you_should_add_at_least_one_person_to_executives_list);
    }

    if(this.selectedPurposes.length < 1) {
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

  searchForLicense() {

  }

  private _buildDatepickerControlsMap() {
    this.datepickerControlsMap = {
      establishmentDate: this.establishmentDate
    };
  }

  buildExecutiveManagementForm(): void {
    this.executiveManagementForm = this.fb.group({
      nameLikePassport: [null, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]],
      enNameLikePassport: [null, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]],
      jobTitle: [null, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]],
      executiveNationality: [null, [CustomValidators.required]],
      executiveIdentificationNumber: [null, [CustomValidators.required].concat(CustomValidators.commonValidations.qId)],
      passportNumber: [null, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]],
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
      projectImplementationPeriod: [null, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(5)]]
    });
  }

  listenToTransfereeTypeChange() {
    this.transfereeType.valueChanges.subscribe(value => {
      if (value === TransfereeTypeEnum.INDIVIDUAL) {
        this.individualTransfereeTypeSelected.next();
      } else if (value === TransfereeTypeEnum.EXTERNAL_ORGANIZATION) {
        this.externalOrganizationTransfereeTypeSelected.next();
      } else {
        this.noTransfereeTypeSelected.next();
      }
    });
  }

  listenToIndividualTransfereeTypeSelected() {
    this.individualTransfereeTypeSelected
      .pipe(takeUntil(this.destroy$))
      .subscribe(_ => {
        this.isIndividualTransferee = true;
        this.isExternalOrganizationTransferee = false;
        this.dontRequireReceiverOrganizationInfoFields();
        this.requireReceiverPersonInfoFields();
        this.selectedExecutives = [];
      });
  }

  listenToExternalOrganizationTransfereeTypeSelected() {
    this.externalOrganizationTransfereeTypeSelected
      .pipe(takeUntil(this.destroy$))
      .subscribe(_ => {
        this.isIndividualTransferee = false;
        this.isExternalOrganizationTransferee = true;
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
    this.receiverIdentificationNumber.setValidators([CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]);
    this.receiverPassportNumber.setValidators([CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]);
    this.receiverPhone1.setValidators([CustomValidators.required].concat(CustomValidators.commonValidations.phone));
    this.receiverPhone2.setValidators(CustomValidators.commonValidations.phone);
  }

  dontRequireReceiverPersonInfoFields() {
    this.receiverNameLikePassport.setValidators([CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]);
    this.receiverEnglishNameLikePassport.setValidators([CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')]);
    this.receiverJobTitle.setValidators([CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]);
    this.receiverNationality.setValidators([]);
    this.receiverIdentificationNumber.setValidators([CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]);
    this.receiverPassportNumber.setValidators([CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]);
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

  listenToDomainChanges() {
    this.domain.valueChanges.subscribe(val => {
      if(val === DomainTypes.HUMANITARIAN) {
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
    const executive = this.executiveManagementForm.getRawValue();
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
      if(i === selectedIndex) {
        continue;
      }

      if(selectedExecutives[i].executiveIdentificationNumber === toBeEditedExecutive.executiveIdentificationNumber) {
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

  // mapFormToExecutive(form: any): TransferFundsExecutiveManagement {
  //   const executive: TransferFundsExecutiveManagement = new TransferFundsExecutiveManagement();
  //   executive.nameLikePassport = form.nameLikePassport;
  //   executive.enNameLikePassport = form.enNameLikePassport;
  //   executive.jobTitle = form.jobTitle;
  //   executive.executiveNationality = form.executiveNationality;
  //   executive.executiveIdentificationNumber = form.executiveIdentificationNumber;
  //   executive.executivephone1 = form.executivephone1;
  //   executive.executivephone2 = form.executivephone2;
  //   executive.passportNumber = form.passportNumber;
  //   executive.executiveNationalityInfo = AdminResult.createInstance(form.executiveNationalityInfo);
  //
  //   return executive;
  // }
  //
  // mapExecutiveToForm(executive: TransferFundsExecutiveManagement): any {
  //   return {
  //     nameLikePassport: executive.nameLikePassport,
  //     enNameLikePassport: executive.enNameLikePassport,
  //     jobTitle: executive.jobTitle,
  //     executiveNationality: executive.executiveNationality,
  //     executiveIdentificationNumber: executive.executiveIdentificationNumber,
  //     executivephone1: executive.executivephone1,
  //     executivephone2: executive.executivephone2,
  //     passportNumber: executive.passportNumber,
  //     executiveNationalityInfo: executive.executiveNationalityInfo
  //   };
  // }

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
    for(let i = 0; i < purposes.length; i++) {
      if(purposes[i].isEqual(purpose)) {
        return i;
      }
    }

    return null;
  }

  savePurpose() {
    const purpose = this.setPurposeInfoProperties(new TransferFundsCharityPurpose().clone(this.transferPurpose.getRawValue() as TransferFundsCharityPurpose));
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
      if(i === selectedIndex) {
        continue;
      }

      if(selectedPurposes[i].isEqual(toBeEditedPurpose)) {
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
}
