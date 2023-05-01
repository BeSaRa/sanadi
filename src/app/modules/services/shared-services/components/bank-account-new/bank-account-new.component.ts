import {Component, Input} from '@angular/core';
import {UiCrudListGenericComponent} from '@app/generics/ui-crud-list-generic-component';
import {BankAccount} from '@models/bank-account';
import {ComponentType} from '@angular/cdk/overlay';
import {CommonUtils} from '@helpers/common-utils';
import {IMenuItem} from '@modules/context-menu/interfaces/i-menu-item';
import {DialogService} from '@services/dialog.service';
import {LangService} from '@services/lang.service';
import {
  BankAccountNewPopupComponent
} from '@modules/services/shared-services/popups/bank-account-new-popup/bank-account-new-popup.component';
import {Country} from '@models/country';
import {SortEvent} from '@contracts/sort-event';
import {ActionIconsEnum} from '@enums/action-icons-enum';
import {IKeyValue} from '@contracts/i-key-value';
import {ToastService} from '@services/toast.service';

@Component({
  selector: 'bank-account-new',
  templateUrl: './bank-account-new.component.html',
  styleUrls: ['./bank-account-new.component.scss']
})
export class BankAccountNewComponent extends UiCrudListGenericComponent<BankAccount> {
  @Input() countriesList: Country[] = [];

  constructor(public lang: LangService,
              public toast: ToastService,
              public dialog: DialogService) {
    super();
  }

  actions: IMenuItem<BankAccount>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: BankAccount) => !this.readonly && this.edit$.next(item),
      show: (_item: BankAccount) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: BankAccount) => this.confirmDelete$.next(item),
      show: (_item: BankAccount) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: BankAccount) => this.view$.next(item),
    }
  ];
  displayColumns: string[] = ['bankName', 'accountNumber', 'iBan', 'country', 'actions'];
  sortingCallbacks = {
    country: (a: BankAccount, b: BankAccount, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.countryInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.countryInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  _getDialogComponent(): ComponentType<any> {
    return BankAccountNewPopupComponent;
  }

  _getNewInstance(override: Partial<BankAccount> | undefined): BankAccount {
    return new BankAccount().clone(override ?? {});
  }

  _getDeleteConfirmMessage(record: BankAccount): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.iBan});
  }

  getExtraDataForPopup(): IKeyValue {
    return {
      countriesList: this.countriesList
    };
  }

}
