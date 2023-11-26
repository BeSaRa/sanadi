import {Component} from '@angular/core';
import {ActionIconsEnum} from '@enums/action-icons-enum';
import {CommonUtils} from '@helpers/common-utils';
import {SortEvent} from '@contracts/sort-event';
import {ManagementCouncil} from '@models/management-council';
import {IMenuItem} from '@modules/context-menu/interfaces/i-menu-item';
import {UiCrudListGenericComponent} from '@app/generics/ui-crud-list-generic-component';
import {ComponentType} from '@angular/cdk/portal';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {
  ManagementCouncilPopupComponent
} from '../../popups/management-council-popup/management-council-popup.component';

@Component({
  selector: 'management-council',
  templateUrl: './management-council.component.html',
  styleUrls: ['./management-council.component.scss'],
})
export class ManagementCouncilComponent extends UiCrudListGenericComponent<ManagementCouncil> {

  constructor() {
    super();
  }

  displayColumns: string[] = ['identificationNumber','englishName', 'passportNumber', 'actions'];
  actions: IMenuItem<ManagementCouncil>[] = [
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: ManagementCouncil) => this.edit$.next(item),
      show: (_item: ManagementCouncil) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: ManagementCouncil) => this.confirmDelete$.next(item),
      show: (_item: ManagementCouncil) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: ManagementCouncil) => this.view$.next(item),
    }
  ];
  sortingCallbacks = {
    nationality: (a: ManagementCouncil, b: ManagementCouncil, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.nationalityInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.nationalityInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
  }

  _getNewInstance(override?: Partial<ManagementCouncil> | undefined): ManagementCouncil {
    return new ManagementCouncil().clone(override ?? {});
  }

  _getDialogComponent(): ComponentType<any> {
    return ManagementCouncilPopupComponent;
  }

  _getDeleteConfirmMessage(record: ManagementCouncil): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.getName()});
  }

  getExtraDataForPopup(): IKeyValue {
    return {}
  }
}
