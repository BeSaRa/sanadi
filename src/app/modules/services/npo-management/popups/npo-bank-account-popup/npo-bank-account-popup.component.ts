import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {UiCrudDialogComponentDataContract} from '@app/contracts/ui-crud-dialog-component-data-contract';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {UiCrudDialogGenericComponent} from '@app/generics/ui-crud-dialog-generic-component.directive';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {AdminResult} from '@app/models/admin-result';
import {Bank} from '@app/models/bank';
import {Lookup} from '@app/models/lookup';
import {NpoBankAccount} from '@app/models/npo-bank-account';
import {BankService} from '@app/services/bank.service';
import {DialogService} from '@app/services/dialog.service';
import {LangService} from '@app/services/lang.service';
import {LookupService} from '@app/services/lookup.service';
import {ToastService} from '@app/services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {Observable} from 'rxjs';

@Component({
  selector: 'npo-bank-account-popup',
  templateUrl: './npo-bank-account-popup.component.html',
  styleUrls: ['./npo-bank-account-popup.component.scss']
})
export class NpoBankAccountPopupComponent extends UiCrudDialogGenericComponent<NpoBankAccount> {
  model: NpoBankAccount;
  form!: UntypedFormGroup;
  operation: OperationTypes;
  popupTitleKey!: keyof ILanguageKeys;
  bankList!: Bank[];
  currenciesList: Lookup[] = this.lookupService.listByCategory.Currency;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<NpoBankAccount>,
              public lang: LangService,
              public dialogRef: DialogRef,
              public dialogService: DialogService,
              public fb: UntypedFormBuilder,
              public toast: ToastService,
              private lookupService: LookupService,
              private bankService: BankService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    this.list = data.list;
  }

  _getNewInstance(override?: Partial<NpoBankAccount> | undefined): NpoBankAccount {
    return new NpoBankAccount().clone(override ?? {});
  }

  initPopup(): void {
    this.popupTitleKey = 'bank_details';
    this.bankService.loadAsLookups().subscribe((data) => {
      this.bankList = data;
    })
  }

  getPopupHeadingText(): string {
    return '';
  }

  destroyPopup(): void {
  }

  afterSave(savedModel: NpoBankAccount, originalModel: NpoBankAccount): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  beforeSave(model: NpoBankAccount, form: UntypedFormGroup): boolean | Observable<boolean> {
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

  prepareModel(model: NpoBankAccount, form: UntypedFormGroup): NpoBankAccount | Observable<NpoBankAccount> {
    let formValue = form.getRawValue();
    return this._getNewInstance({
      ...this.model,
      ...formValue,
      bankInfo: this.bankList.find(x => x.id === formValue.bankId)?.createAdminResult() ?? new AdminResult(),
      currencyInfo: this.currenciesList.find(x => x.lookupKey === formValue.currency)?.createAdminResult() ?? new AdminResult(),
    });
  }

  saveFail(error: Error): void {
    throw new Error(error.message);
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.getBankAccountFields(true));
  }
}
