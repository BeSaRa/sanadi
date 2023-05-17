import {Component} from '@angular/core';
import {ActionIconsEnum} from '@enums/action-icons-enum';
import {CommercialActivity} from '@models/commercial-activity';
import {IMenuItem} from '@modules/context-menu/interfaces/i-menu-item';
import {DialogService} from '@services/dialog.service';
import {LangService} from '@services/lang.service';
import {ToastService} from '@services/toast.service';
import {
  CommercialActivityPopupComponent
} from '../../popups/commercial-activity-popup/commercial-activity-popup.component';
import {UiCrudListGenericComponent} from '@app/generics/ui-crud-list-generic-component';
import {ComponentType} from '@angular/cdk/portal';
import {IKeyValue} from '@app/interfaces/i-key-value';

@Component({
  selector: 'commercial-activity',
  templateUrl: './commercial-activity.component.html',
  styleUrls: ['./commercial-activity.component.scss']
})
export class CommercialActivityComponent extends UiCrudListGenericComponent<CommercialActivity> {

  constructor() {
    super();
  }

  displayColumns = ['activityName', 'details', 'actions'];
  actions: IMenuItem<CommercialActivity>[] = [
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: CommercialActivity) => this.edit$.next(item),
      show: (_item: CommercialActivity) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: CommercialActivity) => this.confirmDelete$.next(item),
      show: (_item: CommercialActivity) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: CommercialActivity) => this.view$.next(item),
    }
  ];

  _getNewInstance(override?: Partial<CommercialActivity> | undefined): CommercialActivity {
    return new CommercialActivity().clone(override ?? {});
  }

  _getDialogComponent(): ComponentType<any> {
    return CommercialActivityPopupComponent
  }

  _getDeleteConfirmMessage(record: CommercialActivity): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.activityName})
  }

  getExtraDataForPopup(): IKeyValue {
    return {}
  }
}
