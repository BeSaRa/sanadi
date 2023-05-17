import {Component} from '@angular/core';
import {IMenuItem} from '@modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@enums/action-icons-enum';
import {BestPractices} from '@models/best-practices';
import {BestPracticesPopupComponent} from '../../../../popups/best-practices-popup/best-practices-popup.component';
import {UiCrudListGenericComponent} from '@app/generics/ui-crud-list-generic-component';
import {ComponentType} from '@angular/cdk/portal';
import {IKeyValue} from '@app/interfaces/i-key-value';

@Component({
  selector: 'best-practices-list',
  templateUrl: './best-practices-list.component.html',
  styleUrls: ['./best-practices-list.component.scss']
})
export class BestPracticesListComponent extends UiCrudListGenericComponent<BestPractices> {

  constructor() {
    super();
  }

  displayColumns: string[] = ['bestPracticesListString', 'statement', 'actions'];
  actions: IMenuItem<BestPractices>[] = [
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: BestPractices) => this.edit$.next(item),
      show: (_item: BestPractices) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: BestPractices) => this.confirmDelete$.next(item),
      show: (_item: BestPractices) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: BestPractices) => this.view$.next(item),
      show: (_item: BestPractices) => this.readonly
    }
  ];

  _getNewInstance(override?: Partial<BestPractices> | undefined): BestPractices {
    return new BestPractices().clone(override ?? {});
  }

  _getDialogComponent(): ComponentType<any> {
    return BestPracticesPopupComponent
  }

  _getDeleteConfirmMessage(record: BestPractices): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.bestPracticesListString});
  }

  getExtraDataForPopup(): IKeyValue {
    return {}
  }

}
