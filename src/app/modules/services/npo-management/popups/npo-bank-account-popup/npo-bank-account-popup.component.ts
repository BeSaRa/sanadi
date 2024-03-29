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
import {LookupService} from '@app/services/lookup.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {Observable} from 'rxjs';

@Component({
  selector: 'npo-bank-account-popup',
  templateUrl: './npo-bank-account-popup.component.html',
  styleUrls: ['./npo-bank-account-popup.component.scss']
})
export class NpoBankAccountPopupComponent extends UiCrudDialogGenericComponent<NpoBankAccount> {
  popupTitleKey: keyof ILanguageKeys;
  currenciesList: Lookup[] = this.lookupService.listByCategory.Currency;
  hideFullScreen = true;
  bankList: Bank[] = [];

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<NpoBankAccount>,
              public dialogRef: DialogRef,
              public fb: UntypedFormBuilder,
              private lookupService: LookupService,
              private bankService: BankService) {
    super();
    this.setInitDialogData(data);
    this.popupTitleKey = 'bank_details';
  }

  _getNewInstance(override?: Partial<NpoBankAccount> | undefined): NpoBankAccount {
    return new NpoBankAccount().clone(override ?? {});
  }

  initPopup(): void {
    this.loadBankList();
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

  _isDuplicate(record1: Partial<NpoBankAccount>, record2: Partial<NpoBankAccount>): boolean {
    return (record1 as NpoBankAccount).isEqual(record2 as NpoBankAccount);
  }

  beforeSave(model: NpoBankAccount, form: UntypedFormGroup): boolean | Observable<boolean> {
    if (this.form.invalid) {
      this.displayRequiredFieldsMessage();
      return false;
    }

    if (this.isDuplicateInList(form.getRawValue())) {
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

  private loadBankList(): void {
    this.bankService.loadAsLookups().subscribe((data) => {
      this.bankList = data;
    })
  }
}
