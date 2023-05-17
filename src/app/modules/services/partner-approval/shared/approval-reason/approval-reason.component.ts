import {Component} from '@angular/core';
import {ActionIconsEnum} from '@enums/action-icons-enum';
import {ApprovalReason} from "@models/approval-reason";
import {IMenuItem} from '@modules/context-menu/interfaces/i-menu-item';
import {ApprovalReasonPopupComponent} from '../../popups/approval-reason-popup/approval-reason-popup.component';
import {UiCrudListGenericComponent} from '@app/generics/ui-crud-list-generic-component';
import {ComponentType} from '@angular/cdk/portal';
import {IKeyValue} from '@app/interfaces/i-key-value';

@Component({
  selector: 'approval-reason',
  templateUrl: './approval-reason.component.html',
  styleUrls: ['./approval-reason.component.scss']
})
export class ApprovalReasonComponent extends UiCrudListGenericComponent<ApprovalReason> {

  constructor() {
    super();
  }

  displayColumns = ['projects', 'research', 'fieldVisit', 'actions'];
  actions: IMenuItem<ApprovalReason>[] = [
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: ApprovalReason) => this.edit$.next(item),
      show: (_item: ApprovalReason) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: ApprovalReason) => this.confirmDelete$.next(item),
      show: (_item: ApprovalReason) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: ApprovalReason) => this.view$.next(item)
    }
  ];

  _getNewInstance(override?: Partial<ApprovalReason> | undefined): ApprovalReason {
    return new ApprovalReason().clone(override ?? {});
  }
  _getDialogComponent(): ComponentType<any> {
    return ApprovalReasonPopupComponent;
  }
  _getDeleteConfirmMessage(record: ApprovalReason): string {
    return this.lang.map.msg_confirm_delete_x.change({x:record.projects})
  }
  getExtraDataForPopup(): IKeyValue {
    return {}
  }

}
