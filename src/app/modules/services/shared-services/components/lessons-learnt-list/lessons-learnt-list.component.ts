import {ActionIconsEnum} from '@enums/action-icons-enum';
import {UiCrudListGenericComponent} from '@app/generics/ui-crud-list-generic-component';
import {ComponentType} from '@angular/cdk/portal';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {Component} from '@angular/core';
import {LessonsLearned} from '@app/models/lessons-learned';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import { LessonsLearntPopupComponent } from '../../popups/lessons-learnt-popup/lessons-learnt-popup.component';

@Component({
  selector: 'lessons-learnt-list',
  templateUrl: './lessons-learnt-list.component.html',
  styleUrls: ['./lessons-learnt-list.component.scss']
})
export class LessonsLearntListComponent extends UiCrudListGenericComponent<LessonsLearned> {

  constructor() {
    super();
  }

  displayColumns = ['lessonsLearntListString', 'statement', 'actions'];
  actions: IMenuItem<LessonsLearned>[] = [
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: LessonsLearned) => this.edit$.next(item),
      show: (_item: LessonsLearned) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: LessonsLearned) => this.confirmDelete$.next(item),
      show: (_item: LessonsLearned) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: LessonsLearned) => this.view$.next(item),
      show: (_item: LessonsLearned) => this.readonly
    }
  ];

  _getNewInstance(override?: Partial<LessonsLearned> | undefined): LessonsLearned {
    return new LessonsLearned().clone(override ?? {});
  }

  _getDialogComponent(): ComponentType<any> {
    return LessonsLearntPopupComponent;
  }

  _getDeleteConfirmMessage(record: LessonsLearned): string {
    return this.lang.map.msg_confirm_delete_selected
  }

  getExtraDataForPopup(): IKeyValue {
    return {}
  }

}
