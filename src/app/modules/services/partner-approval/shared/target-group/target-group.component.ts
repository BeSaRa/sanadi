import { Component, Input } from '@angular/core';
import { LangService } from "@services/lang.service";
import { ToastService } from "@services/toast.service";
import { DialogService } from "@services/dialog.service";
import { TargetGroup } from "@models/target-group";
import { ActionIconsEnum } from '@enums/action-icons-enum';
import { IMenuItem } from '@modules/context-menu/interfaces/i-menu-item';
import { TargetGroupPopupComponent } from '../../popups/target-group-popup/target-group-popup.component';
import { UiCrudListGenericComponent } from '@app/generics/ui-crud-list-generic-component';
import { ComponentType } from '@angular/cdk/portal';
import { IKeyValue } from '@app/interfaces/i-key-value';

@Component({
  selector: 'target-group',
  templateUrl: './target-group.component.html',
  styleUrls: ['./target-group.component.scss']
})
export class TargetGroupComponent extends UiCrudListGenericComponent<TargetGroup> {
  _getNewInstance(override?: Partial<TargetGroup> | undefined): TargetGroup {
    return new TargetGroup().clone(override ?? {});
  }
  _getDialogComponent(): ComponentType<any> {
    return TargetGroupPopupComponent
  }
  _getDeleteConfirmMessage(record: TargetGroup): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.targetedGroup});
  }
  getExtraDataForPopup(): IKeyValue {
    return {};
  }
  @Input() targetGroupList: TargetGroup[] = [];

  constructor(public lang: LangService,
              public toast: ToastService,
              public dialog: DialogService) {
    super();
  }
  actions: IMenuItem<TargetGroup>[] = [
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: TargetGroup) => this.edit$.next(item),
      show: (_item: TargetGroup) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: TargetGroup) => this.confirmDelete$.next(item),
      show: (_item: TargetGroup) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: TargetGroup) => this.view$.next(item),
    }
  ]; 
  displayColumns: string[] = ['services', 'targetedGroup', 'actions'];

}
