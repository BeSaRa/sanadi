import {Component, Input} from '@angular/core';
import {Country} from '@models/country';
import {BankAccount} from '@models/bank-account';
import {ActionIconsEnum} from '@enums/action-icons-enum';
import {CommonUtils} from '@helpers/common-utils';
import {SortEvent} from '@contracts/sort-event';
import {IMenuItem} from '@modules/context-menu/interfaces/i-menu-item';
import {BankAccountPopupComponent} from '../../popups/bank-account-popup/bank-account-popup.component';
import {UiCrudListGenericComponent} from '@app/generics/ui-crud-list-generic-component';
import {ComponentType} from '@angular/cdk/portal';
import {IKeyValue} from '@app/interfaces/i-key-value';

@Component({
  selector: 'bank-account',
  templateUrl: './bank-account.component.html',
  styleUrls: ['./bank-account.component.scss']
})
export class BankAccountComponent extends UiCrudListGenericComponent<BankAccount> {
  @Input() countriesList: Country[] = [];

  constructor() {
    super();
  }

  displayColumns: string[] = ['bankName', 'accountNumber', 'iBan', 'country', 'actions'];
  actions: IMenuItem<BankAccount>[] = [
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: BankAccount) => this.edit$.next(item),
      show: (_item: BankAccount) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: BankAccount) => this.confirmDelete$.next(item),
      show: (_item: BankAccount) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: BankAccount) => this.view$.next(item),
    }
  ];
  sortingCallbacks = {
    country: (a: BankAccount, b: BankAccount, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.countryInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.countryInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  _getNewInstance(override?: Partial<BankAccount> | undefined): BankAccount {
    return new BankAccount().clone(override ?? {});
  }

  _getDialogComponent(): ComponentType<any> {
    return BankAccountPopupComponent;
  }

  _getDeleteConfirmMessage(record: BankAccount): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.bankName});
  }

  getExtraDataForPopup(): IKeyValue {
    return {
      countriesList: this.countriesList
    }
  }
}
