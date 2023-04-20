import { Component, Inject } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { CaseTypes } from '@app/enums/case-types.enum';
import { BankAccount } from '@app/models/bank-account';
import { Country } from '@app/models/country';
import { Lookup } from '@app/models/lookup';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';

@Component({
  selector: 'bank-account-popup',
  templateUrl: './bank-account-popup.component.html',
  styleUrls: ['./bank-account-popup.component.scss']
})
export class BankAccountPopupComponent {
  caseTypes = CaseTypes;
  form: UntypedFormGroup;
  readonly: boolean;
  viewOnly:boolean;
  editItem: BankAccount;
  model: BankAccount;
  countriesList: Country[];
  currenciesList: Lookup[];
  caseType: CaseTypes;
  bankCategoriesList: Lookup[];

  constructor(@Inject(DIALOG_DATA_TOKEN)
  public data: {
    form: UntypedFormGroup,
    readonly: boolean,
    editItem: BankAccount,
    model: BankAccount,
    countriesList: Country[],
    currenciesList: Lookup[],
    caseType: CaseTypes,
    bankCategoriesList:Lookup[],
    viewOnly:boolean,
  },
    public lang: LangService,
    private dialogRef: DialogRef) {
    this.form = data.form;
    this.readonly = data.readonly;
    this.editItem = data.editItem;
    this.model = data.model;
    this.countriesList = data.countriesList;
    this.currenciesList = data.currenciesList;
    this.caseType = data.caseType;
    this.bankCategoriesList = data.bankCategoriesList;
    this.viewOnly = data.viewOnly;
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
