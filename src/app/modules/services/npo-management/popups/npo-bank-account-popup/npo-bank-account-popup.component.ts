import { Component, Inject } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { Bank } from '@app/models/bank';
import { BankAccount } from '@app/models/bank-account';
import { Lookup } from '@app/models/lookup';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';

@Component({
  selector: 'npo-bank-account-popup',
  templateUrl: './npo-bank-account-popup.component.html',
  styleUrls: ['./npo-bank-account-popup.component.scss']
})
export class NpoBankAccountPopupComponent {
  form: UntypedFormGroup;
  readonly: boolean;
  editIndex: number;
  model: BankAccount;
  bankAccountsFormArray: UntypedFormArray;
  bankList: Bank[];
  currenciesList: Lookup[];
  constructor(@Inject(DIALOG_DATA_TOKEN)
    public data: {
      form: UntypedFormGroup,
      readonly: boolean,
      editIndex: number,
      model: BankAccount,
      bankAccountsFormArray: UntypedFormArray,
      bankList: Bank[],
      currenciesList: Lookup[],
    },
    public lang: LangService,
    private dialogRef: DialogRef) {
      this.form = data.form;
      this.readonly = data.readonly;
      this.editIndex = data.editIndex;
      this.model = data.model;
      this.bankAccountsFormArray = data.bankAccountsFormArray;
      this.bankList = data.bankList;
      this.currenciesList = data.currenciesList;
  }
  mapFormTo(form: any): BankAccount {
    const model: BankAccount = new BankAccount().clone(form);

    return model;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
  }
}
