import {NpoBankAccount} from '@models/npo-bank-account';
import {Component} from '@angular/core';
import {NpoBankAccountPopupComponent} from '../../../popups/npo-bank-account-popup/npo-bank-account-popup.component';
import {UiCrudListGenericComponent} from '@app/generics/ui-crud-list-generic-component';
import {ComponentType} from '@angular/cdk/portal';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {SortEvent} from "@contracts/sort-event";
import {CommonUtils} from "@helpers/common-utils";

@Component({
  selector: 'npo-bank-account',
  templateUrl: './npo-bank-account.component.html',
  styleUrls: ['./npo-bank-account.component.scss']
})
export class NpoBankAccountComponent extends UiCrudListGenericComponent<NpoBankAccount> {

  constructor() {
    super();
  }

  displayColumns: string[] = ['bankName', 'accountNumber', 'iban', 'actions'];
  actions: IMenuItem<NpoBankAccount>[] = [
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: NpoBankAccount) => this.edit$.next(item),
      show: (_item: NpoBankAccount) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: NpoBankAccount) => this.confirmDelete$.next(item),
      show: (_item: NpoBankAccount) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: NpoBankAccount) => this.view$.next(item),
    }
  ];
  sortingCallbacks = {
    bankName: (a: NpoBankAccount, b: NpoBankAccount, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.bankInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.bankInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
  }

  _getNewInstance(override?: Partial<NpoBankAccount> | undefined): NpoBankAccount {
    return new NpoBankAccount().clone(override ?? {});
  }

  _getDialogComponent(): ComponentType<any> {
    return NpoBankAccountPopupComponent
  }

  _getDeleteConfirmMessage(record: NpoBankAccount): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.bankInfo.getName()});
  }

  getExtraDataForPopup(): IKeyValue {
    return {};
  }
}
