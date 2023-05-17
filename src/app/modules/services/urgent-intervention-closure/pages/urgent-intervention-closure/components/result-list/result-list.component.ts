import {ComponentType} from '@angular/cdk/portal';
import {Component} from '@angular/core';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {UiCrudListGenericComponent} from '@app/generics/ui-crud-list-generic-component';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {Result} from '@app/models/result';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {
  ResultListPopupComponent
} from '@app/modules/services/urgent-intervention-closure/popups/result-list-popup/result-list-popup.component';

@Component({
  selector: 'result-list',
  templateUrl: './result-list.component.html',
  styleUrls: ['./result-list.component.scss']
})
export class ResultListComponent extends UiCrudListGenericComponent<Result> {

  constructor() {
    super();
  }
  displayColumns = ['outputs', 'expectedResults', 'expectedImpact', 'actions'];
  actions: IMenuItem<Result>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: Result) => this.edit$.next(item),
      show: (_item: Result) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: Result) => this.confirmDelete$.next(item),
      show: (_item: Result) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: Result) => this.view$.next(item),
      show: (_item: Result) => this.readonly
    }
  ];

  _getNewInstance(override?: Partial<Result> | undefined): Result {
    return new Result().clone(override ?? {});
  }

  _getDialogComponent(): ComponentType<any> {
    return ResultListPopupComponent;
  }

  _getDeleteConfirmMessage(record: Result): string {
    return this.lang.map.msg_confirm_delete_selected
  }

  getExtraDataForPopup(): IKeyValue {
    return {}
  }
}
