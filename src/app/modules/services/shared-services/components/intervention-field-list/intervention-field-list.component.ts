import {Component} from '@angular/core';
import {InterventionField} from '@models/intervention-field';
import {UiCrudListGenericComponent} from '@app/generics/ui-crud-list-generic-component';
import {ComponentType} from '@angular/cdk/portal';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {CommonUtils} from '@app/helpers/common-utils';
import {SortEvent} from '@app/interfaces/sort-event';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {
  InterventionFieldListPopupComponent
} from '../../popups/intervention-field-list-popup/intervention-field-list-popup.component';

@Component({
  selector: 'intervention-field-list',
  templateUrl: './intervention-field-list.component.html',
  styleUrls: ['./intervention-field-list.component.scss']
})
export class InterventionFieldListComponent extends UiCrudListGenericComponent<InterventionField> {

  constructor() {
    super();
  }

  displayColumns = ['mainOcha', 'subOcha', 'actions'];
  actions: IMenuItem<InterventionField>[] = [
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: InterventionField) => this.edit$.next(item),
      show: (_item: InterventionField) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: InterventionField) => this.confirmDelete$.next(item),
      show: (_item: InterventionField) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: InterventionField) => this.view$.next(item),
      show: (_item: InterventionField) => this.readonly
    }
  ];
  sortingCallbacks = {
    mainOCha: (a: InterventionField, b: InterventionField, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.mainUNOCHACategoryInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.mainUNOCHACategoryInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    subOcha: (a: InterventionField, b: InterventionField, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.subUNOCHACategoryInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.subUNOCHACategoryInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  _getNewInstance(override?: Partial<InterventionField> | undefined): InterventionField {
    return new InterventionField().clone(override ?? {});
  }

  _getDialogComponent(): ComponentType<any> {
    return InterventionFieldListPopupComponent;
  }

  _getDeleteConfirmMessage(record: InterventionField): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.mainUNOCHACategoryInfo.getName()});
  }

  getExtraDataForPopup(): IKeyValue {
    return {}
  }

}
