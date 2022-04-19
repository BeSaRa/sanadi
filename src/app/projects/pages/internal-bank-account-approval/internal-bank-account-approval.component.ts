import {Component} from '@angular/core';
import {FormGroup, FormBuilder, AbstractControl, FormControl} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {SaveTypes} from '@app/enums/save-types';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {InternalBankAccountApproval} from '@app/models/internal-bank-account-approval';
import {InternalBankAccountApprovalService} from '@app/services/internal-bank-account-approval.service';
import {LangService} from '@app/services/lang.service';
import {Observable} from 'rxjs';
import {LookupService} from '@app/services/lookup.service';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {Lookup} from '@app/models/lookup';
import {Bank} from '@app/models/bank';
import {BankAccount} from '@app/models/bank-account';
import {BankCategory} from '@app/enums/bank-category.enum';
import {CustomValidators} from '@app/validators/custom-validators';
import {exhaustMap, filter, map, takeUntil, tap} from 'rxjs/operators';
import {CollectorApproval} from '@app/models/collector-approval';
import {SelectedLicenseInfo} from '@app/interfaces/selected-license-info';
import {LicenseService} from '@app/services/license.service';
import {InternalBankAccountLicense} from '@app/license-models/internal-bank-account-license';
import {BankAccountRequestTypes} from '@app/enums/bank-account-request-types';
import {BankAccountOperationTypes} from '@app/enums/bank-account-operation-types';
import {EmployeeService} from '@app/services/employee.service';

@Component({
  selector: 'internal-bank-account-approval',
  templateUrl: './internal-bank-account-approval.component.html',
  styleUrls: ['./internal-bank-account-approval.component.scss']
})
export class InternalBankAccountApprovalComponent extends EServicesGenericComponent<InternalBankAccountApproval, InternalBankAccountApprovalService> {
  form!: FormGroup;
  requestTypes: Lookup[] = this.lookupService.listByCategory.BankRequestType
    .sort((a, b) => a.lookupKey - b.lookupKey);

  bankOperationTypes: Lookup[] = this.lookupService.listByCategory.BankOperationType;
  banks: Bank[] = [];
  // bankCategories: Lookup[] = this.lookupService.listByCategory.InternalBankCategory;
  bankCategories: Lookup[] = [new Lookup().clone({arName: 'رئيسي', enName: 'Main', lookupKey: 1}),
    new Lookup().clone({arName: 'فرعي', enName: 'Sub', lookupKey: 2})];
  currencies: Lookup[] = this.lookupService.listByCategory.Currency;
  currentBankAccounts: BankAccount[] = [];
  oldLicenseFullSerialControl: FormControl = new FormControl();
  private displayedColumns: string[] = ['fullSerial', 'status', 'requestTypeInfo', 'actions'];
  selectedAccountsDisplayedColumns: string[] = ['accountNumber', 'actions'];
  updateNewAccountFieldsVisible = false;
  selectedBankAccounts: BankAccount[] = [];
  showAddAccountsToMerge = false;
  showResponsiblePersons = false;

  constructor(public lang: LangService,
              public fb: FormBuilder,
              public service: InternalBankAccountApprovalService,
              private lookupService: LookupService,
              private dialog: DialogService,
              private toast: ToastService,
              private licenseService: LicenseService,
              private employeeService: EmployeeService) {
    super();
  }

  get basicInfo(): FormGroup {
    return this.form.get('basicInfo')! as FormGroup;
  }

  get specialExplanation(): FormGroup {
    return this.form.get('explanation')! as FormGroup;
  }

  get requestType(): AbstractControl {
    return this.form.get('basicInfo.requestType')!;
  }

  get operationType(): AbstractControl {
    return this.form.get('basicInfo.operationType')!;
  }

  get category(): AbstractControl {
    return this.form.get('basicInfo.category')!;
  }

  get mainAccount(): AbstractControl {
    return this.form.get('basicInfo.mainAccount')!;
  }

  get bankAccountsToMerge(): AbstractControl {
    return this.form.get('basicInfo.internalBankAccountDTO')!;
  }

  get accountType(): AbstractControl {
    return this.form.get('basicInfo.category')!;
  }

  get oldLicenseFullSerialField(): AbstractControl {
    return this.form.get('basicInfo.oldLicenseFullSerial')!;
  }

  get accountNumber(): FormControl {
    return (this.form.get('basicInfo.accountNumber')) as FormControl;
  }

  get iban(): FormControl {
    return (this.form.get('basicInfo.iBan')) as FormControl;
  }

  get swiftCode(): FormControl {
    return (this.form.get('basicInfo.swiftCode')) as FormControl;
  }

  get selectedBankAccountToMerge(): FormControl {
    return (this.form.get('basicInfo.selectedBankAccountToMerge')) as FormControl;
  }

  _getNewInstance(): InternalBankAccountApproval {
    return new InternalBankAccountApproval();
  }

  _initComponent(): void {

  }

  _buildForm(): void {
    const model = new InternalBankAccountApproval();
    this.form = this.fb.group({
      basicInfo: this.fb.group(model.buildBasicInfo(true)),
      explanation: this.fb.group(model.buildExplanation(true))
    });
  }

  _afterBuildForm(): void {
    this.loadBanks();
    this.listenToBankCategoryChange();
    this.listenToRequestTypeChanges();
    this.listenToOperationTypeChanges();
    this.loadBankAccounts();
    this.selectedBankAccounts = this.model?.internalBankAccountDTO!;
    // this.listenToRequestTypeAndOperationTypeChanges();
    // this.toggleRequestType(this.requestType.value);
    // this.toggleOperationType(this.operationType.value);
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if(this.requestType.value == BankAccountRequestTypes.NEW &&
      this.operationType.value == BankAccountOperationTypes.MERGE) {
      if (this.selectedBankAccounts.length < 2) {
        this.dialog.error('You Have To Select At Least 2 Bank Accounts To Be Merged');
        return false;
      }
    }
    return this.form.valid;
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    return this.form.valid;
  }

  _afterLaunch(): void {
    this._resetForm();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }

  _prepareModel(): InternalBankAccountApproval | Observable<InternalBankAccountApproval> {
    const model = new InternalBankAccountApproval().clone({
      ...this.model,
      ...this.basicInfo.getRawValue(),
      ...this.specialExplanation.getRawValue()
    });
    model.organizationId = this.employeeService.getOrgUnit()?.id!;
    model!.internalBankAccountDTO = this.selectedBankAccounts
    return model;
  }

  _afterSave(model: InternalBankAccountApproval, saveType: SaveTypes, operation: OperationTypes): void {
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

  _launchFail(error: any): void {

  }

  _destroyComponent(): void {

  }

  _updateForm(model: InternalBankAccountApproval | undefined): void {
    if (!model) {
      return;
    }
    this.model = (new InternalBankAccountApproval()).clone({...this.model, ...model});
    this.form.patchValue({
      basicInfo: this.model?.buildBasicInfo(),
      explanation: this.model?.buildExplanation()
    });

    this.toggleMainAccountControl(this.category.value);
    this.requestTypeOrOperationTypeChanged();
  }

  _resetForm(): void {
    this.form.reset();
    this.operation = OperationTypes.CREATE;
  }

  loadBanks() {
    this.service.loadBanks().subscribe(list => {
      this.banks = list;
    });
  }

  loadBankAccounts() {
    this.service.loadBankAccounts().subscribe(list => {
      this.currentBankAccounts = list;
    });
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

  enableAccountType() {
    this.accountType.enable();
    this.accountType.setValidators([CustomValidators.required]);
    this.accountType.updateValueAndValidity();
  }

  disableAccountType() {
    this.accountType.patchValue(null);
    this.accountType.disable();
    this.accountType.setValidators([]);
    this.accountType.updateValueAndValidity();
  }

  listenToBankCategoryChange() {
    this.category.valueChanges.subscribe(val => {
      this.toggleMainAccountControl(val);
    });
  }

  private listenToRequestTypeChanges() {
    this.requestType
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((val: number) => {
        this.model!.requestType = val;
        // this.toggleRequestType(val);
        this.requestTypeOrOperationTypeChanged();
      });
  }

  private listenToOperationTypeChanges() {
    this.operationType
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((val: number) => {
        this.model!.operationType = val;
        // this.toggleOperationType(val);
        this.requestTypeOrOperationTypeChanged();
      });
  }

  toggleMainAccountControl(accountCategory: number) {
    if (accountCategory === BankCategory.SUB) {
      this.enableMainAccount();
    } else {
      this.disableMainAccount();
    }
  }

  requestTypeOrOperationTypeChanged() {
    if (this.requestType.value === BankAccountRequestTypes.NEW) {
      this.oldLicenseFullSerialField.patchValue(null);
      this.oldLicenseFullSerialField.disable();
      this.hideUpdateAccountFields();
      this.hideUpdateMergeFields();
      if(this.operationType.value == BankAccountOperationTypes.MERGE) {
        this.disableMainAccountAndAccountType();
        this.showAddAccountsToMerge = true;
      } else {
        this.enableMainAccountAndAccountType();
        this.showAddAccountsToMerge = false;
      }
    } else if (this.requestType.value === BankAccountRequestTypes.UPDATE) {
      this.oldLicenseFullSerialField.enable();

      if (this.operationType.value == BankAccountOperationTypes.NEW_ACCOUNT) {
        this.showUpdateBankAccountFields();
        this.hideUpdateMergeFields();
        this.enableMainAccountAndAccountType();
        this.showResponsiblePersons = false;
      } else if (this.operationType.value == BankAccountOperationTypes.MERGE) {
        this.showUpdateBankAccountFields();
        this.showUpdateMergeFields();
        this.disableMainAccountAndAccountType();
        this.showResponsiblePersons = true;
      }
    } else if(this.requestType.value === BankAccountRequestTypes.CANCEL) {
      this.oldLicenseFullSerialField.enable();
      this.hideUpdateAccountFields();
      this.hideUpdateMergeFields();
    } else if(this.requestType.value == null) {
      this.oldLicenseFullSerialField.patchValue(null);
      this.oldLicenseFullSerialField.disable();
      this.hideUpdateAccountFields();
      this.hideUpdateMergeFields();
    }
  }

  showUpdateBankAccountFields() {
    this.accountNumber.setValidators([CustomValidators.required]);
    this.iban.setValidators([CustomValidators.required]);
    this.swiftCode.setValidators([CustomValidators.required]);

    this.oldLicenseFullSerialField.setValidators([CustomValidators.required]);
    this.oldLicenseFullSerialControl.setValidators([CustomValidators.required]);
    this.oldLicenseFullSerialField.updateValueAndValidity();
    this.oldLicenseFullSerialControl.updateValueAndValidity();

    if (!this.updateNewAccountFieldsVisible) {
      this.updateNewAccountFieldsVisible = true;
    }
  }

  hideUpdateAccountFields() {
    this.accountNumber.setValidators([]);
    this.accountNumber.patchValue(null);
    this.iban.setValidators([]);
    this.iban.patchValue(null);
    this.swiftCode.setValidators([]);
    this.swiftCode.patchValue(null);

    this.oldLicenseFullSerialField.setValidators([]);
    this.oldLicenseFullSerialControl.setValidators([]);
    this.oldLicenseFullSerialField.updateValueAndValidity();
    this.oldLicenseFullSerialControl.updateValueAndValidity();

    if (this.updateNewAccountFieldsVisible) {
      this.updateNewAccountFieldsVisible = false;
    }
  }

  showUpdateMergeFields() {

  }

  hideUpdateMergeFields() {

  }

  enableMainAccountAndAccountType() {
    this.enableMainAccount();
    this.enableAccountType();
  }

  disableMainAccountAndAccountType() {
    this.disableMainAccount();
    this.disableAccountType();
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
    if (!this.oldLicenseFullSerialField.value) {
      this.dialog.error(this.lang.map.need_license_number_to_search);
      return;
    }

    this.licenseService
      .internalBankAccountSearch<CollectorApproval>({
        fullSerial: this.oldLicenseFullSerialField.value
      })
      .pipe(tap(licenses => !licenses.length && this.dialog.info(this.lang.map.no_result_for_your_search_criteria)))
      .pipe(filter(licenses => !!licenses.length))
      .pipe(exhaustMap((licenses) => {
        return licenses.length === 1 ? this.validateSingleLicense(licenses[0]) : this.openSelectLicense(licenses);
      }))
      .pipe(
        filter<null | SelectedLicenseInfo<InternalBankAccountLicense, InternalBankAccountLicense>, SelectedLicenseInfo<InternalBankAccountLicense, InternalBankAccountLicense>>
        ((info): info is SelectedLicenseInfo<InternalBankAccountLicense, InternalBankAccountLicense> => !!info))
      .subscribe((_info) => {
        this._updateForm(_info.details.convertToItem());
      });
  }

  addToSelectedBankAccounts() {
    const selectedAccount = this.currentBankAccounts.find(b => b.id == this.selectedBankAccountToMerge.value)!;
    if(!this.selectedBankAccounts.includes(selectedAccount)) {
      this.selectedBankAccounts = this.selectedBankAccounts.concat(selectedAccount);
    } else {
      this.dialog.error(this.lang.map.selected_item_already_exists)
    }
  }

  removeBankAccount(bankAccount: BankAccount, event: MouseEvent) {
    event.preventDefault();
    this.selectedBankAccounts = this.selectedBankAccounts.filter(x => x.id != bankAccount.id);
  }
}
