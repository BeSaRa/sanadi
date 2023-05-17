import {Component} from '@angular/core';
import {ActionIconsEnum} from '@enums/action-icons-enum';
import {Goal} from '@models/goal';
import {IMenuItem} from '@modules/context-menu/interfaces/i-menu-item';
import {GoalPopupComponent} from '../../popups/goal-popup/goal-popup.component';
import {UiCrudListGenericComponent} from '@app/generics/ui-crud-list-generic-component';
import {ComponentType} from '@angular/cdk/portal';
import {IKeyValue} from '@app/interfaces/i-key-value';

@Component({
  selector: 'goal',
  templateUrl: './goal.component.html',
  styleUrls: ['./goal.component.scss'],
})
export class GoalComponent extends UiCrudListGenericComponent<Goal> {

  constructor() {
    super();
  }

  displayColumns = ['goal', 'actions'];
  actions: IMenuItem<Goal>[] = [
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: Goal) => this.edit$.next(item),
      show: (_item: Goal) => !this.readonly,
    },
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: Goal) => this.confirmDelete$.next(item),
      show: (_item: Goal) => !this.readonly,
    },
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: Goal) => this.view$.next(item),
    },
  ];

  _getNewInstance(override?: Partial<Goal> | undefined): Goal {
    return new Goal().clone(override ?? {});
  }

  _getDialogComponent(): ComponentType<any> {
    return GoalPopupComponent
  }

  _getDeleteConfirmMessage(record: Goal): string {
    return this.lang.map.msg_confirm_delete_selected
  }

  getExtraDataForPopup(): IKeyValue {
    return {};
  }
}
