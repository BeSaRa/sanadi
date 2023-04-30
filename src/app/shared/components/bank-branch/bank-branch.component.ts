import { Component, Input} from '@angular/core';
import { LangService } from '@services/lang.service';
import { ToastService } from '@services/toast.service';
import { DialogService } from '@services/dialog.service';
import { BankBranch } from '@app/models/bank-branch';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { UiCrudListGenericComponent } from '@app/generics/ui-crud-list-generic-component';
import { ComponentType } from '@angular/cdk/portal';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { BankBranchPopupComponent } from '@app/shared/popups/bank-branch-popup/bank-branch-popup.component';

@Component({
  selector: 'bank-branch',
  templateUrl: './bank-branch.component.html',
  styleUrls: ['./bank-branch.component.scss']
})
export class BankBranchComponent extends UiCrudListGenericComponent<BankBranch> {
  @Input() showHeader: boolean = true;
  actions: IMenuItem<BankBranch>[] = [
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: BankBranch) => this.edit$.next(item),
      show: (_item: BankBranch) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: BankBranch) => this.confirmDelete$.next(item),
      show: (_item: BankBranch) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: BankBranch) => this.view$.next(item)
    }
  ];
  displayColumns: string[] = ['fullName', 'email', 'fax', 'phone', 'recordNo', 'actions'];
  _getNewInstance(override?: Partial<BankBranch> | undefined): BankBranch {
    return new BankBranch().clone(override ?? {});
  }
  _getDialogComponent(): ComponentType<any> {
    return BankBranchPopupComponent
  }
  _getDeleteConfirmMessage(record: BankBranch): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.fullName});
  }
  getExtraDataForPopup(): IKeyValue {
    return {}
  }
  @Input() branchList: BankBranch[] = [];
  constructor(public lang: LangService,
    public toast: ToastService,
    public dialog: DialogService) {
    super();
  }
}
