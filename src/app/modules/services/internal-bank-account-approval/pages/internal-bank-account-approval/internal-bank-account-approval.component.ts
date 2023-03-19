import { BankAccountEnNameKeys, BankAccountOperationTypes } from '@enums/bank-account-operation-types';
import { Component } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { OperationTypes } from '@enums/operation-types.enum';
import { SaveTypes } from '@enums/save-types';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { InternalBankAccountApproval } from '@models/internal-bank-account-approval';
import { InternalBankAccountApprovalService } from '@services/internal-bank-account-approval.service';
import { LangService } from '@services/lang.service';
import { Observable, of } from 'rxjs';
import { LookupService } from '@services/lookup.service';
import { DialogService } from '@services/dialog.service';
import { ToastService } from '@services/toast.service';
import { Lookup } from '@models/lookup';
import { Bank } from '@models/bank';
import { BankAccount } from '@models/bank-account';
import { CustomValidators } from '@app/validators/custom-validators';
import { exhaustMap, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SelectedLicenseInfo } from '@contracts/selected-license-info';
import { LicenseService } from '@services/license.service';
import { InternalBankAccountLicense } from '@app/license-models/internal-bank-account-license';
import { BankAccountRequestTypes } from '@enums/service-request-types';
import { EmployeeService } from '@services/employee.service';
import { NpoEmployee } from '@models/npo-employee';
import { CommonCaseStatus } from '@enums/common-case-status.enum';
import { OpenFrom } from '@enums/open-from.enum';
import { UserClickOn } from '@enums/user-click-on.enum';
import { BankService } from '@services/bank.service';
import { InternalBankCategoryEnum } from '@enums/internal-bank-category-enum';
import { FieldControlAndLabelKey } from '@app/types/types';
import { CommonUtils } from '@app/helpers/common-utils';

@Component({
  selector: 'internal-bank-account-approval',
  templateUrl: './internal-bank-account-approval.component.html',
  styleUrls: ['./internal-bank-account-approval.component.scss']
})
export class InternalBankAccountApprovalComponent extends EServicesGenericComponent<InternalBankAccountApproval, InternalBankAccountApprovalService> {
  form!: UntypedFormGroup;
  bankAccountSearchCriteriaForm!: UntypedFormGroup;
  requestTypes: Lookup[] = this.lookupService.listByCategory.BankRequestType
    .sort((a, b) => a.lookupKey - b.lookupKey);

  bankOperationTypes: Lookup[] = this.lookupService.listByCategory.BankOperationType
    .sort((a, b) => a.lookupKey - b.lookupKey);

  bankOperationTypesWithoutCancel: Lookup[] = this.lookupService.listByCategory.BankOperationType
    .filter(x => x.lookupKey !== BankAccountOperationTypes.INACTIVE)
    .sort((a, b) => a.lookupKey - b.lookupKey);

  flexBankOperationTypes: Lookup[] = [];

  banks: Bank[] = [];
  bankCategories: Lookup[] = this.lookupService.listByCategory.InternalBankCategory;
  currencies: Lookup[] = this.lookupService.listByCategory.Currency;
  currentBankAccounts: BankAccount[] = [];
  bankAccountsBasedOnCurrencyAndBank: BankAccount[] = [];
  selectedBankAccounts: BankAccount[] = [];
  selectedLicenses: InternalBankAccountApproval[] = [];
  selectedNPOEmployees: NpoEmployee[] = [];
  // oldLicenseFullSerialControl: FormControl = new FormControl();
  selectedResponsiblePersonControl: UntypedFormControl = new UntypedFormControl();
  private displayedColumns: string[] = ['fullSerial', 'status', 'requestTypeInfo', 'operationTypeInfo', 'actions'];
  selectedAccountsDisplayedColumns: string[] = [];
  selectedAccountsDisplayedColumnsForMerge: string[] = ['accountNumber', 'bankName', 'bankCategory', 'toBeMergedIn', 'actions'];
  selectedAccountsDisplayedColumnsForCancel: string[] = ['accountNumber', 'bankName', 'bankCategory', 'actions'];
  selectedPersonsDisplayedColumns: string[] = ['qId', 'arName', 'enName', 'jobTitleInfo', 'actions'];
  selectedLicenseDisplayedColumns: string[] = ['serial', 'bankName', 'currency', 'bankCategory'];
  updateNewAccountFieldsVisible = false;
  isNewMerge: boolean = false;
  isUpdateMerge = false;
  isUpdateNewAccount = false;
  isCancel = false;
  isExternalUser!: boolean;
  hasSearchedForLicense = false;

  constructor(public lang: LangService,
    public fb: UntypedFormBuilder,
    public service: InternalBankAccountApprovalService,
    private lookupService: LookupService,
    private dialog: DialogService,
    private toast: ToastService,
    private licenseService: LicenseService,
    private bankService: BankService,
    private employeeService: EmployeeService) {
    super();
  }

  formProperties = {
    requestType: () => {
      return this.getObservableField('requestType', 'requestType');
    },
    operationType: () => {
      return this.getObservableField('operationType', 'operationType');
    }
  }

  get basicInfo(): UntypedFormGroup {
    return this.form.get('basicInfo')! as UntypedFormGroup;
  }

  get specialExplanation(): UntypedFormGroup {
    return this.form.get('explanation')! as UntypedFormGroup;
  }

  get requestType(): AbstractControl {
    return this.form.get('basicInfo.requestType')!;
  }

  get operationType(): AbstractControl {
    return this.form.get('basicInfo.operationType')!;
  }

  get bankAccountCategory(): AbstractControl {
    return this.form.get('basicInfo.category')!;
  }

  get purpose(): AbstractControl {
    return this.form.get('basicInfo.purpose')!;
  }

  get bankId(): AbstractControl {
    return this.form.get('basicInfo.bankId')!;
  }

  get currency(): AbstractControl {
    return this.form.get('basicInfo.currency')!;
  }

  get mainAccount(): AbstractControl {
    return this.form.get('basicInfo.mainAccount')!;
  }

  get oldLicenseFullSerialField(): AbstractControl {
    return this.form.get('basicInfo.oldLicenseFullSerial')!;
  }

  get bankAccountSearchCriteriaField(): AbstractControl {
    return this.bankAccountSearchCriteriaForm.get('bankAccountSearchCriteria')!;
  }

  get accountNumber(): UntypedFormControl {
    return (this.form.get('basicInfo.accountNumber')) as UntypedFormControl;
  }

  get iban(): UntypedFormControl {
    return (this.form.get('basicInfo.iBan')) as UntypedFormControl;
  }

  get swiftCode(): UntypedFormControl {
    return (this.form.get('basicInfo.swiftCode')) as UntypedFormControl;
  }

  get selectedBankAccountToMerge(): UntypedFormControl {
    return (this.form.get('basicInfo.selectedBankAccountToMerge')) as UntypedFormControl;
  }

  get ownerOfMergedBankAccounts(): UntypedFormControl {
    return (this.form.get('basicInfo.ownerOfMergedBankAccounts')) as UntypedFormControl;
  }

  get selectedResponsiblePerson(): UntypedFormControl {
    return (this.form.get('basicInfo.selectedResponsiblePerson')) as UntypedFormControl;
  }

  _getNewInstance(): InternalBankAccountApproval {
    return new InternalBankAccountApproval();
  }

  _initComponent(): void {
    this.isExternalUser = this.employeeService.isExternalUser();
  }

  _buildForm(): void {
    const model = new InternalBankAccountApproval();
    this.form = this.fb.group({
      basicInfo: this.fb.group(model.buildBasicInfo(true)),
      explanation: this.fb.group(model.buildExplanation(true))
    });

    this.bankAccountSearchCriteriaForm = this.fb.group({
      bankAccountSearchCriteria: [null, [CustomValidators.required]]
    });
  }

  isSelectedNPOEmployees() {
    return this.isUpdateMerge || this.isUpdateNewAccount
  }

  hasBankAccounts() {
    return this.isNewMerge || this.isUpdateMerge || this.isCancel
  }
  _afterBuildForm(): void {
    this.listenToBankCategoryChange();
    this.listenToBankIdChange();
    this.listenToCurrencyChange();
    this.listenToOperationTypeChanges();
    this.loadBanks();
    this.loadBankAccounts();
    this.handleReadonly();
  }

  isNewRequestType(): boolean {
    return this.requestType.value === BankAccountRequestTypes.NEW;
  }

  isUpdateRequestType(): boolean {
    return this.requestType.value === BankAccountRequestTypes.UPDATE;
  }

  isCancelRequestType(): boolean {
    return this.requestType.value === BankAccountRequestTypes.CANCEL;
  }

  isMergeOperationType(): boolean {
    return this.operationType.value == BankAccountOperationTypes.MERGE;
  }

  isNewAccountOperationType(): boolean {
    return this.operationType.value == BankAccountOperationTypes.NEW_ACCOUNT;
  }

  private _isValidDraftData(): boolean {
    const draftFields: FieldControlAndLabelKey[] = [
      { control: this.requestType, labelKey: 'request_type' },
      { control: this.operationType, labelKey: 'bank_operation_type' },
    ];
    const invalidDraftField = this.getInvalidDraftField(draftFields);
    if (invalidDraftField) {
      this.dialog.error(this.lang.map.msg_please_validate_x_to_continue.change({ x: this.lang.map[invalidDraftField.labelKey] }));
      invalidDraftField.control.markAsTouched();
      return false;
    }
    return true
  }

  isEditLicenseAllowed(): boolean {
    // if new or draft record, edit is allowed
    let isAllowed = !this.model?.id || (!!this.model?.id && this.model.canCommit());
    return isAllowed && CommonUtils.isValidValue(this.requestType.value) &&
      this.requestType.value === BankAccountRequestTypes.UPDATE;
  }
  private _isValidBankAndNpoData() {
    if ((this.isNewRequestType() || this.isUpdateRequestType()) && this.isMergeOperationType()) {
      if (this.selectedBankAccounts.length < 2) {
        this.dialog.error(this.lang.map.you_have_to_select_at_least_two_bank_accounts);
        return false;
      }
    }
    if (this.isCancelRequestType()) {
      if (this.selectedBankAccounts.length < 1) {
        this.dialog.error(this.lang.map.you_have_to_select_at_least_one_bank_account);
        return false;
      }
    }
    if (this.isUpdateRequestType()) {
      if (this.selectedNPOEmployees.length < 1) {
        this.dialog.error(this.lang.map.you_have_to_select_at_least_one_responsible_person);
        return false;
      }
    }
    return true;
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (!this.selectedLicenses.length && this.isUpdateRequestType()) {
      this.dialog.error(this.lang.map.please_select_license_to_complete_save);
      return false;
    } else {
      if (saveType === SaveTypes.DRAFT) {
        return this._isValidDraftData();
      }
      if (!this._isValidBankAndNpoData()) {
        return false;
      }

      return this.form.valid;
    }
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    return this.form.valid;
  }

  _afterLaunch(): void {
    this.resetForm$.next();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }

  _prepareModel(): InternalBankAccountApproval | Observable<InternalBankAccountApproval> {
    const model = new InternalBankAccountApproval().clone({
      ...this.model,
      ...this.basicInfo.getRawValue(),
      ...this.specialExplanation.getRawValue()
    });
    model.organizationId = this.employeeService.getProfile()?.id!;

    // set owner of merged accounts
    if (this.isNewMerge || this.isUpdateMerge) {
      this.selectedBankAccounts.forEach(x => {
        x.isMergeAccount = x.id === this.ownerOfMergedBankAccounts.value;
      });

      const mergeAccount = this.selectedBankAccounts.find(x => x.isMergeAccount);
      if (!!mergeAccount) {
        model.category = mergeAccount.type;
      }
    }
    model!.internalBankAccountDTOs = this.selectedBankAccounts;
    model!.bankAccountExecutiveManagementDTOs = this.selectedNPOEmployees;
    return model;
  }

  _afterSave(model: InternalBankAccountApproval, saveType: SaveTypes, operation: OperationTypes): void {
    this.model = model;
    if (
      (operation === OperationTypes.CREATE && saveType === SaveTypes.FINAL) ||
      (operation === OperationTypes.UPDATE && saveType === SaveTypes.COMMIT)
    ) {
      this.dialog.success(this.lang.map.msg_request_has_been_added_successfully.change({ serial: model.fullSerial }));
    } else {
      this.toast.success(this.lang.map.request_has_been_saved_successfully);
    }
  }

  _saveFail(error: any): void {

  }

  _launchFail(error: any): void {

  }

  _destroyComponent(): void {

  }

  _updateForm(model: InternalBankAccountApproval | undefined): void {
    if (!model) {
      return;
    }
    this.model = (new InternalBankAccountApproval()).clone({ ...this.model, ...model });
    this.loadBankAccountsBasedOnCurrencyAndBank(this.model.category, this.model.bankId, this.model.currency);
    this.form.patchValue({
      basicInfo: this.model?.buildBasicInfo(),
      explanation: this.model?.buildExplanation()
    });

    this.requestTypeOrOperationTypeChanged();
    this.toggleAccountCategoryControl(this.bankAccountCategory.value);

    this.selectedBankAccounts = this.model.internalBankAccountDTOs?.map(ba => {
      ba.bankInfo = (new Bank()).clone(ba.bankInfo);
      ba.bankCategoryInfo = ba.bankCategoryInfo ? (new Lookup()).clone(ba.bankCategoryInfo) : new Lookup();
      return ba;
    });

    // set radio button of selectedBankAccounts
    if (this.operationType.value == BankAccountOperationTypes.MERGE) {
      this.ownerOfMergedBankAccounts.patchValue(this.selectedBankAccounts.find(x => x.isMergeAccount)!.id);
    }

    this.selectedNPOEmployees = this.model.bankAccountExecutiveManagementDTOs;
  }

  _resetForm(): void {
    this.form.reset();
    this.operation = OperationTypes.CREATE;
    this.selectedNPOEmployees = [];
    this.selectedBankAccounts = [];
    this.selectedLicenses = [];
    this.isNewMerge = false;
    this.isUpdateMerge = false;
    this.isUpdateNewAccount = false;
    this.hasSearchedForLicense = false;
  }

  loadBanks() {
    this.bankService.loadAsLookups().subscribe(list => {
      this.banks = list;
    });
  }

  loadBankAccounts() {
    this.service.loadBankAccounts().subscribe(list => {
      this.currentBankAccounts = list;
    });
  }

  listenToBankCategoryChange() {
    this.bankAccountCategory.valueChanges.subscribe(val => {
      this.loadBankAccountsBasedOnCurrencyAndBank(this.bankAccountCategory.value, this.bankId.value, this.currency.value);
      this.toggleAccountCategoryControl(val);
    });
  }

  listenToBankIdChange() {
    this.bankId.valueChanges.subscribe(_ => {
      this.loadBankAccountsBasedOnCurrencyAndBank(this.bankAccountCategory.value, this.bankId.value, this.currency.value);
    });
  }

  listenToCurrencyChange() {
    this.currency.valueChanges.subscribe(_ => {
      this.loadBankAccountsBasedOnCurrencyAndBank(this.bankAccountCategory.value, this.bankId.value, this.currency.value);
    });
  }

  loadBankAccountsBasedOnCurrencyAndBank(bankCategory: number, bankId: number, currencyId: number) {
    if (bankCategory === InternalBankCategoryEnum.SUB && bankId && currencyId) {
      this.service.loadBankAccountsBasedOnCurrencyAndBank(bankId, currencyId).subscribe(list => {
        this.bankAccountsBasedOnCurrencyAndBank = list;
      });
    } else {
      this.mainAccount.patchValue(null);
      this.bankAccountsBasedOnCurrencyAndBank = [];
    }
  }

  private listenToOperationTypeChanges() {
    this.operationType
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((val: number) => {
        this.model!.operationType = val;
        // this.toggleOperationType(val);

        this.selectedBankAccounts = [];
        this.bankAccountSearchCriteriaField.patchValue(null);
        if (this.requestType.value === BankAccountRequestTypes.NEW) {
          this.onSelectNewRequestType();
        } else if (this.requestType.value === BankAccountRequestTypes.UPDATE) {
          this.onSelectUpdateRequestType();
        } else if (this.requestType.value === BankAccountRequestTypes.CANCEL) {
          this.onSelectCancelRequestType();
        } else if (this.requestType.value == null) {
          this.onSelectNoneRequestType();
        }
      });
  }

  toggleAccountCategoryControl(accountCategory: number) {
    if (accountCategory === InternalBankCategoryEnum.SUB) {
      this.enableMainAccount();
    } else {
      this.disableMainAccount();
    }
  }

  requestTypeOrOperationTypeChanged() {
    this.selectedBankAccounts = [];
    this.bankAccountSearchCriteriaField.patchValue(null);
    if (this.requestType.value === BankAccountRequestTypes.NEW) {
      this.onSelectNewRequestType();
    } else if (this.requestType.value === BankAccountRequestTypes.UPDATE) {
      this.onSelectUpdateRequestType();
    } else if (this.requestType.value === BankAccountRequestTypes.CANCEL) {
      this.onSelectCancelRequestType();
    } else if (this.requestType.value == null) {
      this.onSelectNoneRequestType();
    }
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
        this.selectedBankAccounts = [];
        this.bankAccountSearchCriteriaField.patchValue(null);
        if (this.requestType.value === BankAccountRequestTypes.NEW) {
          this.onSelectNewRequestType();
        } else if (this.requestType.value === BankAccountRequestTypes.UPDATE) {
          this.onSelectUpdateRequestType();
        } else if (this.requestType.value === BankAccountRequestTypes.CANCEL) {
          this.onSelectCancelRequestType();
        } else if (this.requestType.value == null) {
          this.onSelectNoneRequestType();
        }

        this.requestType$.next(requestTypeValue);
      } else {
        this.requestType.setValue(this.requestType$.value);
      }
    });
  }

  onSelectNewRequestType() {
    this.flexBankOperationTypes = this.bankOperationTypesWithoutCancel.filter((bot => bot.enName != BankAccountEnNameKeys.Account));
    this.enableCancelAccountFields();
    this.enableNewNewAccountFields();
    this.disableNewNewAccountFields();
    this.hideUpdateBankAccountFields();
    this.hideUpdateMergeFields();
    this.isUpdateMerge = false;
    this.isUpdateNewAccount = false;
    this.isCancel = false;
    this.requirePurposeField();
    if (this.operationType.value == BankAccountOperationTypes.MERGE) {
      this.disableNewMergeAccountsFields();
      this.enableNewMergeAccountsFields();
      this.isNewMerge = true;
      this.selectedAccountsDisplayedColumns = this.selectedAccountsDisplayedColumnsForMerge;
    } else if (this.operationType.value == BankAccountOperationTypes.INACTIVE) {
      // this.enableMainAccountAndAccountType();
      this.dontRequirePurposeField();
      this.isNewMerge = false;
    } else {
      this.isNewMerge = false;
    }
  }

  onSelectUpdateRequestType() {
    this.flexBankOperationTypes = this.bankOperationTypesWithoutCancel.filter((bot => bot.enName != BankAccountEnNameKeys.NEW_ACCOUNT));
    this.enableSearchField();
    this.enableCancelAccountFields();
    this.isCancel = false;
    if (this.operationType.value == BankAccountOperationTypes.NEW_ACCOUNT) {
      this.showUpdateBankAccountFields();
      this.hideUpdateMergeFields();
      this.enableUpdateNewAccountFields();
      this.disableUpdateNewAccountFields();
      this.isUpdateMerge = false;
      this.isUpdateNewAccount = true;
      this.isNewMerge = false;
    } else if (this.operationType.value == BankAccountOperationTypes.MERGE) {
      this.showUpdateBankAccountFields();
      this.showUpdateMergeFields();
      this.enableUpdateMergeAccountsFields();
      this.disableUpdateMergeAccountsFields();
      this.isUpdateMerge = true;
      this.isUpdateNewAccount = false;
      this.isNewMerge = false;
      this.selectedAccountsDisplayedColumns = this.selectedAccountsDisplayedColumnsForMerge;
    }
    this.dontRequirePurposeField();
  }

  onSelectCancelRequestType() {
    this.flexBankOperationTypes = this.bankOperationTypes;
    this.dontRequirePurposeField();
    // this.enableCancelAccountFields();
    this.disableCancelAccountFields();
    this.hideUpdateBankAccountFields();
    this.hideUpdateMergeFields();
    this.selectedAccountsDisplayedColumns = this.selectedAccountsDisplayedColumnsForCancel;
    this.isNewMerge = false;
    this.isUpdateMerge = false;
    this.isCancel = true;
  }

  onSelectNoneRequestType() {
    this.dontRequirePurposeField();
    this.oldLicenseFullSerialField.patchValue(null);
    this.oldLicenseFullSerialField.disable();
    this.hideUpdateBankAccountFields();
    this.hideUpdateMergeFields();
  }

  showUpdateBankAccountFields() {
    if (!this.model?.isUpdatedNewAccount) {
      this.accountNumber.setValidators([CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.NUMBERS_MAXLENGTH)]);
      this.iban.setValidators([CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.NUMBERS_MAXLENGTH)]);
      this.swiftCode.setValidators([CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.SWIFT_CODE_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.SWIFT_CODE_MIN)]);
    }

    this.setOldLicenseFullSerialRequired();

    if (!this.updateNewAccountFieldsVisible) {
      this.updateNewAccountFieldsVisible = true;
    }
  }

  setOldLicenseFullSerialRequired() {
    this.oldLicenseFullSerialField.setValidators([CustomValidators.required, CustomValidators.maxLength(50)]);
    // this.oldLicenseFullSerialControl.setValidators([CustomValidators.required, CustomValidators.maxLength(50)]);
    this.oldLicenseFullSerialField.updateValueAndValidity();
    // this.oldLicenseFullSerialControl.updateValueAndValidity();
  }

  hideUpdateBankAccountFields() {
    this.accountNumber.setValidators([]);
    this.accountNumber.patchValue(null);
    this.iban.setValidators([]);
    this.iban.patchValue(null);
    this.swiftCode.setValidators([]);
    this.swiftCode.patchValue(null);

    this.oldLicenseFullSerialField.setValidators([]);
    // this.oldLicenseFullSerialControl.setValidators([]);
    this.oldLicenseFullSerialField.updateValueAndValidity();
    // this.oldLicenseFullSerialControl.updateValueAndValidity();

    if (this.updateNewAccountFieldsVisible) {
      this.updateNewAccountFieldsVisible = false;
    }
  }

  showUpdateMergeFields() {

  }

  hideUpdateMergeFields() {

  }

  enableNewNewAccountFields() {
    this.enableOperationType();
    this.enableBankAccountCategory();
    this.enablePurpose();
    this.enableBankId();
    this.enableCurrency();
  }

  disableNewNewAccountFields() {
    this.enableOperationType();
    this.disableSearchField();
  }

  enableUpdateNewAccountFields() {
    this.enableOperationType();
    this.enableSearchField();
    this.enableBankAccountCategory();
    this.enablePurpose();
    this.enableBankId();
    this.enableCurrency();
  }

  disableUpdateNewAccountFields() {
    this.enableOperationType();
  }

  enableNewMergeAccountsFields() {
    this.enableOperationType();
  }

  disableNewMergeAccountsFields() {
    this.enableOperationType();
    this.disableSearchField();
    this.disableBankAccountCategory();
    this.disableMainAccount();
  }

  enableUpdateMergeAccountsFields() {
    this.enableOperationType();
    this.enablePurpose();
    this.enableBankId();
    this.enableCurrency();
  }

  disableUpdateMergeAccountsFields() {
    this.enableOperationType();
    this.disableBankAccountCategoryWithoutData();
    this.disableMainAccountWithoutData();
    this.disableBankIdWithoutData();
    this.disableCurrencyWithoutData();
    this.disablePurposeWithoutData();
    // this.disableSearchField();
  }

  enableCancelAccountFields() {
    this.enableOperationType();
    this.enableBankAccountCategory();
    this.enablePurpose();
    this.enableBankId();
    this.enableCurrency();
  }

  disableCancelAccountFields() {
    this.makeOperationTypeCancel();
    this.disableBankAccountCategory();
    this.disablePurpose();
    this.disableBankId();
    this.disableCurrency();
    this.disableMainAccount();
    this.disableSearchField();
  }

  makeOperationTypeCancel() {
    this.operationType.disable({ emitEvent: false });
    this.operationType.setValidators([CustomValidators.required]);
    this.operationType.patchValue(BankAccountOperationTypes.INACTIVE, { emitEvent: false });
  }

  enableOperationType() {
    this.operationType.enable({ emitEvent: false });
    this.operationType.setValidators([CustomValidators.required]);
  }

  requirePurposeField() {
    this.purpose.setValidators([CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX)]);
  }

  dontRequirePurposeField() {
    this.purpose.setValidators([CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX)]);
  }

  disableOperationType() {
    this.operationType.disable({ emitEvent: false });
    this.operationType.setValidators([]);
    this.operationType.patchValue(null, { emitEvent: false });
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

  enableBankAccountCategory() {
    this.bankAccountCategory.enable();
    this.bankAccountCategory.setValidators([CustomValidators.required]);
    this.bankAccountCategory.updateValueAndValidity();
  }

  disableBankAccountCategory() {
    this.bankAccountCategory.patchValue(null);
    this.bankAccountCategory.disable();
    this.bankAccountCategory.setValidators([]);
    this.bankAccountCategory.updateValueAndValidity();
  }

  disableBankAccountCategoryWithoutData() {
    this.bankAccountCategory.disable();
    this.bankAccountCategory.setValidators([]);
    this.bankAccountCategory.updateValueAndValidity();
  }

  enablePurpose() {
    this.purpose.enable();
    this.purpose.setValidators([CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX)]);
    this.purpose.updateValueAndValidity();
  }

  disablePurpose() {
    this.purpose.patchValue(null);
    this.purpose.disable();
    this.purpose.setValidators([]);
    this.purpose.updateValueAndValidity();
  }

  disablePurposeWithoutData() {
    this.purpose.disable();
    this.purpose.setValidators([]);
    this.purpose.updateValueAndValidity();
  }

  enableBankId() {
    this.bankId.enable();
    this.bankId.setValidators([CustomValidators.required]);
    this.bankId.updateValueAndValidity();
  }

  disableBankId() {
    this.bankId.patchValue(null);
    this.bankId.disable();
    this.bankId.setValidators([]);
    this.bankId.updateValueAndValidity();
  }

  disableBankIdWithoutData() {
    this.bankId.disable();
    this.bankId.setValidators([]);
    this.bankId.updateValueAndValidity();
  }

  enableCurrency() {
    this.currency.enable();
    this.currency.setValidators([CustomValidators.required]);
    this.currency.updateValueAndValidity();
  }

  disableCurrency() {
    this.currency.patchValue(null);
    this.currency.disable();
    this.currency.setValidators([]);
    this.currency.updateValueAndValidity();
  }

  disableCurrencyWithoutData() {
    this.currency.disable();
    this.currency.setValidators([]);
    this.currency.updateValueAndValidity();
  }

  enableMainAccount() {
    this.mainAccount.enable();
    this.mainAccount.setValidators([CustomValidators.required]);
    this.mainAccount.updateValueAndValidity();
  }

  disableMainAccount() {
    this.mainAccount.patchValue(null);
    this.mainAccount.disable();
    this.mainAccount.setValidators([]);
    this.mainAccount.updateValueAndValidity();
  }

  disableMainAccountWithoutData() {
    this.mainAccount.disable();
    this.mainAccount.setValidators([]);
    this.mainAccount.updateValueAndValidity();
  }

  enableMainAccountAndAccountType() {
    this.enableMainAccount();
    this.enableBankAccountCategory();
  }

  disableMainAccountAndAccountType() {
    this.disableMainAccount();
    this.disableBankAccountCategory();
  }

  private validateSingleLicense(license: InternalBankAccountLicense): Observable<null | SelectedLicenseInfo<InternalBankAccountLicense, InternalBankAccountLicense>> {
    return this.licenseService.validateLicenseByRequestType<InternalBankAccountLicense>(this.model!.caseType, this.model!.requestType, license.id)
      .pipe(map(validated => {
        return (validated ? {
          selected: validated,
          details: validated
        } : null) as (null | SelectedLicenseInfo<InternalBankAccountLicense, InternalBankAccountLicense>);
      }));
  }

  private openSelectLicense(licenses: InternalBankAccountLicense[]) {
    return this.licenseService.openSelectLicenseDialog(licenses, this.model, true, this.displayedColumns).onAfterClose$ as Observable<{ selected: InternalBankAccountLicense, details: InternalBankAccountLicense }>;
  }

  searchForLicense() {
    let criteriaObject: any = { fullSerial: this.oldLicenseFullSerialField.value };
    if (this.requestType.value === BankAccountRequestTypes.UPDATE && this.operationType.value === BankAccountOperationTypes.NEW_ACCOUNT) {
      criteriaObject.operationType = BankAccountOperationTypes.NEW_ACCOUNT;
    }

    if (this.requestType.value === BankAccountRequestTypes.UPDATE && this.operationType.value === BankAccountOperationTypes.MERGE) {
      criteriaObject.operationType = BankAccountOperationTypes.MERGE;
    }

    this.licenseService
      .internalBankAccountSearch<InternalBankAccountApproval>(criteriaObject)
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(licenses => !licenses.length && this.dialog.info(this.lang.map.no_result_for_your_search_criteria)))
      .pipe(filter(licenses => !!licenses.length))
      .pipe(exhaustMap((licenses) => {
        return licenses.length === 1 ? this.validateSingleLicense(licenses[0]) : this.openSelectLicense(licenses);
      }))
      .pipe(
        filter<null | SelectedLicenseInfo<InternalBankAccountLicense, InternalBankAccountLicense>, SelectedLicenseInfo<InternalBankAccountLicense, InternalBankAccountLicense>>
          ((info): info is SelectedLicenseInfo<InternalBankAccountLicense, InternalBankAccountLicense> => !!info))
      .subscribe((_info) => {
        this.hasSearchedForLicense = true;
        const item = _info.details.convertToItem();
        this.selectedLicenses = [item];
        this._updateForm(item);
      });
  }

  searchForBankAccount() {
    this.service.searchForBankAccount(this.bankAccountSearchCriteriaField.value)
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(bankAccount => !bankAccount && this.dialog.info(this.lang.map.no_result_for_your_search_criteria)))
      .subscribe(bankAccount => {
        this.addToSelectedBankAccounts(bankAccount);
      });
  }

  private openSelectEmployee(employees: NpoEmployee[]) {
    return this.service.openSelectEmployee(employees).onAfterClose$ as Observable<NpoEmployee>;
  }

  searchForNPOEmployee() {
    const qId = this.selectedResponsiblePerson.value;
    if (!qId || qId.length == 0 || qId.length === 11) {
      this.service.searchNPOEmployees(qId)
        .pipe(takeUntil(this.destroy$))
        .pipe(tap(employees => !employees.length && this.dialog.info(this.lang.map.no_result_for_your_search_criteria)))
        .pipe(filter(employees => !!employees.length))
        .pipe(exhaustMap((employees) => {
          return employees.length === 1 ? of(employees[0]) : this.openSelectEmployee(employees);
        }))
        .pipe(filter(emp => emp != null))
        .subscribe((employee) => {
          this.addToSelectedResponsiblePersons(employee);
        });
    } else {
      this.dialog.error(this.lang.map.can_be_11_digits);
    }
  }

  addToSelectedBankAccounts(bankAccount: BankAccount) {
    if (!this.selectedBankAccounts.find(x => x.id === bankAccount.id)) {
      if (this.isNewMerge && bankAccount.bankCategoryInfo.lookupKey === InternalBankCategoryEnum.SUB) {
        this.dialog.error(this.lang.map.selected_bank_account_is_sub_account);
      } else {
        if (bankAccount.subAccounts && bankAccount.subAccounts.length && bankAccount.subAccounts.length > 0) {
          let message = this.isCancel ? this.generateConfirmCancelMessage(bankAccount)! : this.generateConfirmMergeMessage(bankAccount)!;

          this.dialog.confirm(message).onAfterClose$.subscribe((userClickOn: UserClickOn) => {
            if (userClickOn === UserClickOn.YES) {
              this.pushBankAccountToList(bankAccount);
            } else {
              return;
            }
          });
        } else {
          this.pushBankAccountToList(bankAccount);
        }
      }
    } else {
      this.dialog.error(this.lang.map.selected_item_already_exists);
    }
  }

  pushBankAccountToList(bankAccount: BankAccount) {
    if (this.selectedBankAccounts.length === 0 && (this.isNewMerge || this.isUpdateMerge)) {
      this.ownerOfMergedBankAccounts.patchValue(bankAccount.id);
    }

    this.selectedBankAccounts = this.selectedBankAccounts.concat(bankAccount);
  }

  generateConfirmMergeMessage(bankAccount: BankAccount): string {
    let message = bankAccount.subAccounts.length === 1 ? this.lang.map.this_sub_account_of_the_selected_account + ' ' : this.lang.map.these_sub_accounts_of_the_selected_account + ' ';
    let willBeMergedSegment = bankAccount.subAccounts.length === 1 ? this.lang.map.will_be_merged_also_single : this.lang.map.will_be_merged_also;
    for (let i = 0; i < bankAccount.subAccounts.length; i++) {
      if (i === 0) {
        message = message.concat('(' + bankAccount.subAccounts[i].accountNumber);
      } else {
        message = message.concat(', ' + bankAccount.subAccounts[i].accountNumber);
      }

      if (i === bankAccount.subAccounts.length - 1) {
        message = message.concat('\) ' + willBeMergedSegment + '<br/>' + this.lang.map.msg_confirm_continue);
      }
    }

    return message;
  }

  generateConfirmCancelMessage(bankAccount: BankAccount): string {
    let message = bankAccount.subAccounts.length === 1 ? this.lang.map.this_sub_account_of_the_selected_account + ' ' : this.lang.map.these_sub_accounts_of_the_selected_account + ' ';
    let willBeCanceledSegment = bankAccount.subAccounts.length === 1 ? this.lang.map.will_be_canceled_also_single : this.lang.map.will_be_canceled_also;
    for (let i = 0; i < bankAccount.subAccounts.length; i++) {
      if (i === 0) {
        message = message.concat('(' + bankAccount.subAccounts[i].accountNumber);
      } else {
        message = message.concat(', ' + bankAccount.subAccounts[i].accountNumber);
      }

      if (i === bankAccount.subAccounts.length - 1) {
        message = message.concat('\) ' + willBeCanceledSegment + '<br/>' + this.lang.map.msg_confirm_continue);
      }
    }

    return message;
  }

  removeBankAccount(bankAccount: BankAccount, event: MouseEvent) {
    event.preventDefault();
    this.selectedBankAccounts = this.selectedBankAccounts.filter(x => x.id != bankAccount.id);
  }

  addToSelectedResponsiblePersons(employee: NpoEmployee) {
    if (!this.selectedNPOEmployees.map(x => x.id).includes(employee.id)) {
      employee.identificationNumber = employee.qId;
      this.selectedNPOEmployees = this.selectedNPOEmployees.concat(employee);
    } else {
      this.dialog.error(this.lang.map.selected_item_already_exists);
    }
  }

  removeResponsiblePersons(npoEmployee: NpoEmployee, event: MouseEvent) {
    event.preventDefault();
    this.selectedNPOEmployees = this.selectedNPOEmployees.filter(x => x.id != npoEmployee.id);
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

  // selectOwnerOfMergeAccounts(bankAccount: BankAccount) {
  //   console.log('bank', bankAccount);
  //   console.log('bankAccounts', this.selectedBankAccounts);
  //   if(this.ownerOfMergedBankAccounts.value != bankAccount.id) {
  //     this.selectedBankAccounts.find(x => x.id == bankAccount.id)!.isMergeAccount = true;
  //   }
  // }
}
