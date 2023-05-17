import {Component} from '@angular/core';
import {TargetGroup} from "@models/target-group";
import {ActionIconsEnum} from '@enums/action-icons-enum';
import {IMenuItem} from '@modules/context-menu/interfaces/i-menu-item';
import {TargetGroupPopupComponent} from '../../popups/target-group-popup/target-group-popup.component';
import {UiCrudListGenericComponent} from '@app/generics/ui-crud-list-generic-component';
import {ComponentType} from '@angular/cdk/portal';
import {IKeyValue} from '@app/interfaces/i-key-value';

@Component({
  selector: 'target-group',
  templateUrl: './target-group.component.html',
  styleUrls: ['./target-group.component.scss']
})
export class TargetGroupComponent extends UiCrudListGenericComponent<TargetGroup> {

  constructor() {
    super();
  }

  displayColumns: string[] = ['services', 'targetedGroup', 'actions'];
  actions: IMenuItem<TargetGroup>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: TargetGroup) => this.edit$.next(item),
      show: (_item: TargetGroup) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: TargetGroup) => this.confirmDelete$.next(item),
      show: (_item: TargetGroup) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: TargetGroup) => this.view$.next(item),
    }
  ];

  _getNewInstance(override?: Partial<TargetGroup> | undefined): TargetGroup {
    return new TargetGroup().clone(override ?? {});
  }

  _getDialogComponent(): ComponentType<any> {
    return TargetGroupPopupComponent
  }

  _getDeleteConfirmMessage(record: TargetGroup): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.services});
  }

  getExtraDataForPopup(): IKeyValue {
    return {};
  }

}
