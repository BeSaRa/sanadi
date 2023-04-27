
import {NpoBankAccount} from '@models/npo-bank-account';
import {Component, Input} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import { NpoBankAccountPopupComponent } from '../../../popups/npo-bank-account-popup/npo-bank-account-popup.component';
import { UiCrudListGenericComponent } from '@app/generics/ui-crud-list-generic-component';
import { ComponentType } from '@angular/cdk/portal';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';

@Component({
  selector: 'npo-bank-account',
  templateUrl: './npo-bank-account.component.html',
  styleUrls: ['./npo-bank-account.component.scss']
})
export class NpoBankAccountComponent extends UiCrudListGenericComponent<NpoBankAccount>{
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

  displayColumns: string[] = ['bankName', 'accountNumber', 'iban', 'actions'];
  _getNewInstance(override?: Partial<NpoBankAccount> | undefined): NpoBankAccount {
      return new NpoBankAccount().clone(override ?? {});
  }
  _getDialogComponent(): ComponentType<any> {
    return NpoBankAccountPopupComponent
  }
  _getDeleteConfirmMessage(record: NpoBankAccount): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.iban});
  }
  getExtraDataForPopup(): IKeyValue {
    return {};
  }
  constructor(public lang: LangService,
    public toast: ToastService,
    public dialog: DialogService) {
  super();
  }
  @Input() bankAccountList: NpoBankAccount[] = [];
}
