import {AfterViewInit, ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {OperationTypes} from '@enums/operation-types.enum';
import {SaveTypes} from '@enums/save-types';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {TransferringIndividualFundsAbroad} from '@models/transferring-individual-funds-abroad';
import {LangService} from '@services/lang.service';
import {TransferringIndividualFundsAbroadService} from '@services/transferring-individual-funds-abroad.service';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {LookupService} from '@services/lookup.service';
import {DialogService} from '@services/dialog.service';
import {ToastService} from '@services/toast.service';
import {LicenseService} from '@services/license.service';
import {CommonCaseStatus} from '@enums/common-case-status.enum';
import {OpenFrom} from '@enums/open-from.enum';
import {EmployeeService} from '@services/employee.service';
import {Lookup} from '@models/lookup';
import {DatepickerControlsMap, DatepickerOptionsMap, FieldControlAndLabelKey, TabMap} from '@app/types/types';
import {DateUtils} from '@helpers/date-utils';
import {CustomValidators} from '@app/validators/custom-validators';
import {exhaustMap, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {TransfereeTypeEnum} from '@enums/transferee-type-enum';
import {SelectedLicenseInfo} from '@contracts/selected-license-info';
import {TransferringIndividualFundsAbroadRequestTypeEnum} from '@enums/service-request-types';
import {CountryService} from '@services/country.service';
import {Country} from '@models/country';
import {InternalProjectLicenseResult} from '@models/internal-project-license-result';
import {SharedService} from '@services/shared.service';
import {ReceiverOrganization} from '@models/receiver-organization';
import {ReceiverPerson} from '@models/receiver-person';
import {UserClickOn} from '@enums/user-click-on.enum'
import {TransferTypeEnum} from '@enums/transfer-type-enum';
import {
  TifaTransferPurposeListComponent
} from "@modules/services/transferring-individual-funds-abroad/shared/tifa-transfer-purpose-list/tifa-transfer-purpose-list.component";
import {
  TifaExecutiveManagementListComponent
} from "@modules/services/transferring-individual-funds-abroad/shared/tifa-executive-management-list/tifa-executive-management-list.component";
import {
  TifaPaymentsListComponent
} from "@modules/services/transferring-individual-funds-abroad/shared/tifa-payments-list/tifa-payments-list.component";

@Component({
  selector: 'transferring-individual-funds-abroad',
  templateUrl: './transferring-individual-funds-abroad.component.html',
  styleUrls: ['./transferring-individual-funds-abroad.component.scss']
})
export class TransferringIndividualFundsAbroadComponent extends EServicesGenericComponent<TransferringIndividualFundsAbroad, TransferringIndividualFundsAbroadService> implements AfterViewInit {
  form!: UntypedFormGroup;

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

  selectReceiverOrganizationDisplayedColumns = ['organizationArabicName', 'organizationEnglishName', 'establishmentDate', 'actions'];
  selectReceiverPersonDisplayedColumns = ['receiverNameLikePassport', 'receiverEnglishNameLikePassport', 'receiverIdentificationNumber', 'actions'];

  datepickerControlsMap: DatepickerControlsMap = {};
  datepickerOptionsMap: DatepickerOptionsMap = {
    establishmentDate: DateUtils.getDatepickerOptions({disablePeriod: 'future'}),
  };
  formProperties = {
    requestType: () => {
      return this.getObservableField('requestType', 'requestType');
    },
    transfereeType: () => {
      return this.getObservableField('transfereeType', 'transfereeType');
    },
  }

  isCancel!: boolean;
  isExternalUser!: boolean;

  isRequiredPayments = false;

  transfereeTypeChanged: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);
  individualTransfereeTypeSelected: Subject<void> = new Subject<void>();
  externalOrganizationTransfereeTypeSelected: Subject<void> = new Subject<void>();
  noTransfereeTypeSelected: Subject<void> = new Subject<void>();

  transferTypeChanged: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);
  onceTransferTypeSelected: Subject<void> = new Subject<void>();
  periodicalTransferTypeSelected: Subject<void> = new Subject<void>();
  noTransferTypeSelected: Subject<void> = new Subject<void>();

  isIndividualTransferee!: boolean;
  isExternalOrganizationTransferee!: boolean;
  isOnceTransferType!: boolean;
  isPeriodicalTransferType!: boolean;
  private displayedColumns: string[] = ['fullSerial', 'status', 'requestTypeInfo', 'actions'];
  selectedLicenses: TransferringIndividualFundsAbroad[] = [];
  selectedLicenseDisplayedColumns: string[] = ['serial', 'requestType', 'licenseStatus', 'actions'];
  hasSearchedForLicense = false;
  totalPaymentsAmount = 0;

  tabsData: TabMap = {
    basicInfo: {
      name: 'basicInfo',
      langKey: 'lbl_basic_info',
      index: 0,
      validStatus: () => {
        return !!this.basicInfo && !this.basicInfo.invalid
      },
      isTouchedOrDirty: () => true
    },
    requesterInfo: {
      name: 'requesterInfo',
      langKey: 'requester_info',
      index: 1,
      validStatus: () => {
        return !!this.requesterInfo && !this.requesterInfo.invalid
      },
      isTouchedOrDirty: () => true
    },
    receiverOrganizationInfo: {
      name: 'receiverOrganizationInfo',
      langKey: 'receiver_organization_info',
      index: 2,
      validStatus: () => {
        if (!this.isExternalOrganizationTransferee) {
          return true;
        }
        return !!this.receiverOrganizationInfo && !this.receiverOrganizationInfo.invalid
      },
      isTouchedOrDirty: () => true,
      show: () => this.isExternalOrganizationTransferee
    },
    executiveManagementInfo: {
      name: 'executiveManagementInfo',
      langKey: 'executive_management_info',
      index: 3,
      validStatus: () => {
        if (!this.isExternalOrganizationTransferee || !this.executiveManagementListComponentRef) {
          return true;
        }
        return (this.executiveManagementListComponentRef.list.length > 0);
      },
      isTouchedOrDirty: () => true,
      show: () => this.isExternalOrganizationTransferee
    },
    receiverPersonInfo: {
      name: 'receiverPersonInfo',
      langKey: 'receiver_person_info',
      index: 4,
      validStatus: () => {
        if (!this.isIndividualTransferee) {
          return true;
        }
        return !!this.receiverPersonInfo && !this.receiverPersonInfo.invalid;
      },
      isTouchedOrDirty: () => true,
      show: () => this.isIndividualTransferee
    },
    transferPurposeInfo: {
      name: 'transferPurposeInfo',
      langKey: 'transfer_purpose',
      index: 5,
      validStatus: () => {
        if (!this.transferPurposeListRef || this.isCancel) {
          return true;
        }
        return (this.transferPurposeListRef.list.length > 0);
      },
      isTouchedOrDirty: () => true
    },
    financialTransactionInfo: {
      name: 'financialTransactionInfo',
      langKey: 'financial_transaction_info',
      index: 6,
      validStatus: () => {
        return !!this.financialTransactionInfo && !this.financialTransactionInfo.invalid;
      },
      isTouchedOrDirty: () => true
    },
    payments: {
      name: 'payments',
      langKey: 'payments',
      index: 7,
      validStatus: () => {
        if (!this.isPeriodicalTransferType || this.isCancel || !this.tifaPaymentsListComponentRef) {
          return true;
        }
        return (this.tifaPaymentsListComponentRef.list.length > 0);
      },
      isTouchedOrDirty: () => true,
      show: ()=> this.isPeriodicalTransferType
    },
    specialExplanations: {
      name: 'specialExplanations',
      langKey: 'special_explanations',
      index: 8,
      validStatus: () => {
        return !!this.specialExplanation && !this.specialExplanation.invalid;
      },
      isTouchedOrDirty: () => true
    },
    attachments: {
      name: 'attachments',
      langKey: 'attachments',
      index: 9,
      validStatus: () => true,
      isTouchedOrDirty: () => true
    }
  };

  @ViewChild('executiveManagementListComponent') executiveManagementListComponentRef!: TifaExecutiveManagementListComponent;
  @ViewChild('transferPurposeListComponent') transferPurposeListRef!: TifaTransferPurposeListComponent;
  @ViewChild('tifaPaymentsListComponent') tifaPaymentsListComponentRef!: TifaPaymentsListComponent;

  constructor(public lang: LangService,
              public fb: UntypedFormBuilder,
              private cd: ChangeDetectorRef,
              public service: TransferringIndividualFundsAbroadService,
              private lookupService: LookupService,
              private dialog: DialogService,
              private toast: ToastService,
              private licenseService: LicenseService,
              private employeeService: EmployeeService,
              private countryService: CountryService,
              private sharedService: SharedService) {
    super();
  }

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
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

  get transferType(): UntypedFormControl {
    return this.form.get('financialTransactionInfo.transferType')! as UntypedFormControl;
  }

  get qatariTransactionAmount(): UntypedFormControl {
    return this.form.get('financialTransactionInfo.qatariTransactionAmount')! as UntypedFormControl;
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

  ngAfterViewInit(): void {
    Promise.resolve().then(() => this.cd.detectChanges())
  }

  _initComponent(): void {
    this.loadCountries();
    this.isExternalUser = this.employeeService.isExternalUser();
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
  }

  _afterBuildForm(): void {
    this.listenToExternalOrganizationTransfereeTypeSelected();
    this.listenToIndividualTransfereeTypeSelected();
    this.listenToNoTransfereeTypeSelected();

    this.listenToOnceTransferTypeSelected();
    this.listenToPeriodicalTransferTypeSelected();
    this.listenToNoTransferTypeSelected();

    this.listenToTransfereeSubject();
    this.listenToTransfereeTypeChange();

    this.listenToTransferTypeSubject();
    this.listenToTransferTypeChange();
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

    this.transfereeTypeChanged.next(this.transfereeType.value);
    this.transferTypeChanged.next(this.transferType.value);
    this.handleRequestTypeChange(this.requestType.value, false);

    if (this.requestType.value !== TransferringIndividualFundsAbroadRequestTypeEnum.NEW && this.model?.oldLicenseId) {
      this.service.getByLicenseId(this.model.oldLicenseId).subscribe(ret => {
        this.selectedLicenses = [ret];
        this.hasSearchedForLicense = true;
      })
    }
  }

  _resetForm(): void {
    this.form.reset();
    this.hasSearchedForLicense = false;
    this.isIndividualTransferee = false;
    this.isExternalOrganizationTransferee = false;
    this.isOnceTransferType = false;
    this.isPeriodicalTransferType = false;
    this.executiveManagementListComponentRef?.forceClearComponent();
    this.transferPurposeListRef?.forceClearComponent();
    this.tifaPaymentsListComponentRef?.forceClearComponent();
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
      executiveManagementList: this.executiveManagementListComponentRef?.list ?? [],
      charityPurposeTransferList: this.transferPurposeListRef?.list ?? [],
      payment: this.tifaPaymentsListComponentRef?.list ?? []
    });
  }

  _getNewInstance(): TransferringIndividualFundsAbroad {
    return new TransferringIndividualFundsAbroad();
  }

  private _isValidDraftData(): boolean {
    const draftFields: FieldControlAndLabelKey[] = [
      {control: this.requestType, labelKey: 'request_type'},
    ];
    const invalidDraftField = this.getInvalidDraftField(draftFields);
    if (invalidDraftField) {
      this.dialog.error(this.lang.map.msg_please_validate_x_to_continue.change({x: this.lang.map[invalidDraftField.labelKey]}));
      invalidDraftField.control.markAsTouched();
      return false;
    }
    if (this.isNewRequestType()) {
      return true;
    } else {
      if (!this.selectedLicenses.length) {
        this.dialog.error(this.lang.map.please_select_license_to_complete_save);
        return false;
      }
    }
    return true;
  }

  isNewRequestType(): boolean {
    return this.requestType.value === TransferringIndividualFundsAbroadRequestTypeEnum.NEW;
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (!this.selectedLicenses.length && !this.isNewRequestType()) {
      this.dialog.error(this.lang.map.please_select_license_to_complete_save);
      return false;
    } else {
      if (saveType === SaveTypes.DRAFT) {
        return this._isValidDraftData();
      }
      if (this.isExternalOrganizationTransferee && this.executiveManagementListComponentRef.list.length < 1 && !this.isCancel) {
        this.dialog.error(this.lang.map.you_should_add_at_least_one_person_to_executives_list);
        return false;
      }

      if (!this.transferPurposeListRef || (!this.transferPurposeListRef.list.length && !this.isCancel)) {
        this.dialog.error(this.lang.map.you_should_add_at_least_one_purpose_in_purposes);
        return false;
      }

      if (this.transferType.value === TransferTypeEnum.PERIODICAL) {
        const paymentsList = this.tifaPaymentsListComponentRef?.list ?? [];
        if (paymentsList && paymentsList.length === 0 && !this.isCancel) {
          this.dialog.error(this.lang.map.you_should_add_at_least_one_payment_in_payments);
          return false;
        }

        if ((paymentsList.length > 0) && this.totalPaymentsAmount > +this.qatariTransactionAmount.value) {
          this.dialog.error(this.lang.map.total_payments_should_be_less_than_or_equal_to_transfer_amount);
          return false;
        }
      }
      return this.form.valid;
    }
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
    return this.licenseService.openSelectLicenseDialog(licenses, this.model, true, this.displayedColumns).onAfterClose$ as Observable<{
      selected: TransferringIndividualFundsAbroad,
      details: TransferringIndividualFundsAbroad
    }>;
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
        this.selectedLicenses = [_info.details];
        let value: any = new TransferringIndividualFundsAbroad().clone(_info.details);
        value.requestType = this.model?.requestType!;
        value.oldLicenseFullSerial = _info.details.fullSerial;
        value.oldLicenseSerial = _info.details.serial;
        // set oldLicenseId property from validated object id
        value.oldLicenseId = _info.details.id

        this.hasSearchedForLicense = true;
        value.documentTitle = '';
        value.fullSerial = null;

        // delete id because license details contains old license id, and we are adding new, so no id is needed
        delete value.id;
        delete value.vsId;
        delete value.serial;
        delete value.followUpDate;
        delete value.licenseEndDate;

        this._updateForm(value);
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

  listenToTransfereeTypeChange() {
    this.transfereeType.valueChanges.subscribe(value => {
      this.transfereeTypeChanged.next(value);
    });
  }

  listenToTransferTypeChange() {
    this.transferType.valueChanges.subscribe(value => {
      this.transferTypeChanged.next(value);
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

  listenToTransferTypeSubject() {
    this.transferTypeChanged
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        if (value === TransferTypeEnum.ONCE) {
          this.onceTransferTypeSelected.next();
        } else if (value === TransferTypeEnum.PERIODICAL) {
          this.periodicalTransferTypeSelected.next();
        } else {
          this.noTransferTypeSelected.next();
        }
      });
  }

  handleRequestTypeChange(requestTypeValue: number, userInteraction: boolean = false): void {
    of(userInteraction).pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.confirmChangeRequestType(userInteraction))
    ).subscribe((clickOn: UserClickOn) => {
      if (clickOn === UserClickOn.YES) {
        if (userInteraction) {
          this.resetForm$.next();
          this.requestType.setValue(requestTypeValue);
        }
        if (!requestTypeValue) {
          requestTypeValue = this.requestType && this.requestType.value;
        }
        if (requestTypeValue) {
          this.model!.requestType = requestTypeValue;
        }
        if (!requestTypeValue || requestTypeValue === TransferringIndividualFundsAbroadRequestTypeEnum.NEW) {
          this.enableAllFormsInCaseOfNotCancelRequest();
          this.disableSearchField();
          this.isCancel = false;
        } else if (requestTypeValue === TransferringIndividualFundsAbroadRequestTypeEnum.UPDATE) {
          this.enableAllFormsInCaseOfNotCancelRequest();
          this.enableSearchField();
          this.isCancel = false;
        } else {
          this.disableAllFormsInCaseOfCancelRequest();
          this.enableSearchField();
          this.isCancel = true;
        }

        this.requestType$.next(requestTypeValue);
      } else {
        this.requestType.setValue(this.requestType$.value);
      }
    });
  }

  disableAllFormsInCaseOfCancelRequest() {
    this.transfereeType.disable();

    this.requesterInfo.disable();
    this.requesterInfo.updateValueAndValidity();

    this.receiverPersonInfo.disable();
    this.receiverPersonInfo.updateValueAndValidity();

    this.receiverOrganizationInfo.disable();
    this.receiverOrganizationInfo.updateValueAndValidity();

    this.financialTransactionInfo.disable();
    this.financialTransactionInfo.updateValueAndValidity();

    this.specialExplanation.disable();
    this.specialExplanation.updateValueAndValidity();

    this.form.updateValueAndValidity();
  }

  enableAllFormsInCaseOfNotCancelRequest() {
    this.transfereeType.enable();
    this.requesterInfo.enable();
    this.receiverPersonInfo.enable();
    this.receiverOrganizationInfo.enable();
    this.financialTransactionInfo.enable();
    this.specialExplanation.enable();
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
        this.executiveManagementListComponentRef?.forceClearComponent();
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

  listenToOnceTransferTypeSelected() {
    this.onceTransferTypeSelected
      .pipe(takeUntil(this.destroy$))
      .subscribe(_ => {
        if (!this.isOnceTransferType) {
          this.isOnceTransferType = true;
        }
        if (this.isPeriodicalTransferType) {
          this.isPeriodicalTransferType = false;
        }
        this.isRequiredPayments = false;
        this.tifaPaymentsListComponentRef?.forceClearComponent();
        this.totalPaymentsAmount = 0;
      });
  }

  listenToPeriodicalTransferTypeSelected() {
    this.periodicalTransferTypeSelected
      .pipe(takeUntil(this.destroy$))
      .subscribe(_ => {
        if (!this.isPeriodicalTransferType) {
          this.isPeriodicalTransferType = true;
        }
        if (this.isOnceTransferType) {
          this.isOnceTransferType = false;
        }
        this.isRequiredPayments = true;
      });
  }

  listenToNoTransferTypeSelected() {
    this.noTransferTypeSelected
      .pipe(takeUntil(this.destroy$))
      .subscribe(_ => {
        this.isOnceTransferType = false;
        this.isPeriodicalTransferType = false;
        this.isRequiredPayments = false;
        this.tifaPaymentsListComponentRef?.forceClearComponent();
        this.totalPaymentsAmount = 0;
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
    this.website.setValidators([CustomValidators.required, CustomValidators.pattern('WEBSITE')]);
    this.organizationEmail.setValidators([CustomValidators.required, ...CustomValidators.commonValidations.email]);
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
    this.website.setValidators([CustomValidators.pattern('WEBSITE')]);
    this.organizationEmail.setValidators(CustomValidators.commonValidations.email);
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

  loadCountries() {
    this.countryService.loadAsLookups().subscribe((list: Country[]) => {
      this.countries = list;
    });
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

  sumPayments() {
    /*this.totalPaymentsAmount = this.selectedPayments.reduce((accumulator, x) => {
      return accumulator + +x.totalCost;
    }, 0);*/
  }
}
