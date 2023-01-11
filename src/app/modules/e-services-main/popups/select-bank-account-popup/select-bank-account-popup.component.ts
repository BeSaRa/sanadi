import { BankAccount } from './../../../../models/bank-account';
import { Component, Inject, OnInit } from '@angular/core';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';

@Component({
  selector: 'app-select-bank-account-popup',
  templateUrl: './select-bank-account-popup.component.html',
  styleUrls: ['./select-bank-account-popup.component.scss']
})
export class SelectBankAccountPopupComponent  {

  displayedColumns: string[] = [
    'accountNumber',
    'bankName',
    'iBan'
  ];
  label: keyof ILanguageKeys = 'bank_accounts';

  constructor(
    public lang: LangService,
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      entities: BankAccount[] ;
      select: boolean;
      displayedColumns: string[];
    }
  ) {
    if (this.data.displayedColumns.length > 0) {
      this.displayedColumns = [...this.data.displayedColumns];
    } else {
      this.displayedColumns = [...this.displayedColumns];
    }

    if (this.data.select) {
      this.label = 'select_license';
    }
  }
  actions: IMenuItem<any>[] = [
    // select license/document
    {
      type: 'action',
      label: 'select',
      icon: '',
      onClick: (item: any) => this.selectBankAccount(item),
      show: (_item: any) => this.data.select
    },


  ];
  selectBankAccount(account: BankAccount): void {
    this.dialogRef.close(account);
  }

}
