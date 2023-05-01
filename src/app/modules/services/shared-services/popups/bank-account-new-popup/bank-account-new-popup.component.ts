import {Component, Inject} from '@angular/core';
import {UiCrudDialogGenericComponent} from '@app/generics/ui-crud-dialog-generic-component.directive';
import {BankAccount} from '@models/bank-account';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {Observable} from 'rxjs';
import {LangService} from '@services/lang.service';
import {OperationTypes} from '@enums/operation-types.enum';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {CaseTypes} from '@enums/case-types.enum';
import {DialogService} from '@services/dialog.service';
import {Lookup} from '@models/lookup';
import {LookupService} from '@services/lookup.service';
import {Country} from '@models/country';
import {AdminResult} from '@models/admin-result';
import {ToastService} from '@services/toast.service';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {UiCrudDialogComponentDataContract} from '@contracts/ui-crud-dialog-component-data-contract';

@Component({
  selector: 'bank-account-new-popup',
  templateUrl: './bank-account-new-popup.component.html',
  styleUrls: ['./bank-account-new-popup.component.scss']
})
export class BankAccountNewPopupComponent extends UiCrudDialogGenericComponent<BankAccount> {
  popupTitleKey!: keyof ILanguageKeys;
  form!: UntypedFormGroup;
  model: BankAccount;
  operation: OperationTypes;
  caseType: CaseTypes;
  bankCategoriesList: Lookup[] = this.lookupService.listByCategory.BankCategory;
  currenciesList: Lookup[] = this.lookupService.listByCategory.Currency;
  countriesList: Country[] = [];

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<BankAccount>,
              public lang: LangService,
              public dialogRef: DialogRef,
              public dialogService: DialogService,
              public fb: UntypedFormBuilder,
              public toast: ToastService,
              private lookupService: LookupService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    this.list = data.list;
    this.caseType = data.caseType!;
    this.countriesList = (data.extras && data.extras.countriesList) ?? [];
  }

  initPopup(): void {
    this.popupTitleKey = 'bank_details';
  }

  _getNewInstance(override?: Partial<BankAccount> | undefined): BankAccount {
    return new BankAccount().clone(override ?? {});
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.getBankAccountFields(true, this.caseType));
  }

  afterSave(savedModel: BankAccount, originalModel: BankAccount): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  beforeSave(model: BankAccount, form: UntypedFormGroup): Observable<boolean> | boolean {
    if (this.form.invalid) {
      this.displayRequiredFieldsMessage();
      return false;
    }
    const isDuplicate = this.list.some((x) => x === form.getRawValue());
    if (isDuplicate) {
      this.displayDuplicatedItemMessage();
      return false;
    }
    return true;
  }

  prepareModel(model: BankAccount, form: UntypedFormGroup): Observable<BankAccount> | BankAccount {
    let formValue = form.getRawValue();
    return this._getNewInstance({
      ...this.model,
      ...formValue,
      countryInfo: this.countriesList.find((x) => x.id === formValue.country)?.createAdminResult() ?? new AdminResult(),
      currencyInfo: this.currenciesList.find((x) => x.lookupKey === formValue.currency)?.createAdminResult() ?? new AdminResult(),
      bankCategoryInfo: this.bankCategoriesList.find((x) => x.lookupKey === formValue.currency) ?? new Lookup(),
    });
  }

  saveFail(error: Error): void {
  }

  destroyPopup(): void {
  }
}
