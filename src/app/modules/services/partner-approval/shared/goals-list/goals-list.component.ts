import { GoalList } from '@models/goal-list';
import { Component, Input } from '@angular/core';
import { ActionIconsEnum } from '@enums/action-icons-enum';
import { CommonUtils } from '@helpers/common-utils';
import { SortEvent } from '@contracts/sort-event';
import { IMenuItem } from '@modules/context-menu/interfaces/i-menu-item';
import { DialogService } from '@services/dialog.service';
import { LangService } from '@services/lang.service';
import { ToastService } from '@services/toast.service';
import { GoalsListPopupComponent } from '../../popups/goals-list-popup/goals-list-popup.component';
import { UiCrudListGenericComponent } from '@app/generics/ui-crud-list-generic-component';
import { ComponentType } from '@angular/cdk/portal';
import { IKeyValue } from '@app/interfaces/i-key-value';

@Component({
  selector: 'goals-list',
  templateUrl: './goals-list.component.html',
  styleUrls: ['./goals-list.component.scss']
})
export class GoalsListComponent extends UiCrudListGenericComponent<GoalList> {
  _getNewInstance(override?: Partial<GoalList> | undefined): GoalList {
    return new GoalList().clone(override ?? {});
  }

  _getDialogComponent(): ComponentType<any> {
    return GoalsListPopupComponent
  }

  _getDeleteConfirmMessage(record: GoalList): string {
    return this.lang.map.msg_confirm_delete_selected
  }

  getExtraDataForPopup(): IKeyValue {
    return {};
  }

  @Input() goalsList: GoalList[] = [];
  constructor(public lang: LangService,
    public toast: ToastService,
    public dialog: DialogService) {
  super();
  }
  actions: IMenuItem<GoalList>[] = [
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: GoalList) => this.edit$.next(item),
      show: (_item: GoalList) => !this.readonly,
    },
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: GoalList) => this.confirmDelete$.next(item),
      show: (_item: GoalList) => !this.readonly,
    },
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: GoalList) => this.view$.next(item),
    },
  ];
  displayColumns: string[] = ['domain', 'mainDACCategory', 'mainUNOCHACategory', 'actions'];
  sortingCallbacks = {
    domain: (a: GoalList, b: GoalList, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a)
        ? ''
        : a.domainInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b)
          ? ''
          : b.domainInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    dac: (a: GoalList, b: GoalList, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a)
        ? ''
        : a.mainDACCategoryInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b)
          ? ''
          : b.mainDACCategoryInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    unocha: (a: GoalList, b: GoalList, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a)
        ? ''
        : a.mainUNOCHACategoryInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b)
          ? ''
          : b.mainUNOCHACategoryInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
  };
}
