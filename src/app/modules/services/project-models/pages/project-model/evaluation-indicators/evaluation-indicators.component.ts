import {ComponentType} from '@angular/cdk/portal';
import {Component} from '@angular/core';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {UiCrudListGenericComponent} from '@app/generics/ui-crud-list-generic-component';
import {EvaluationIndicator} from '@app/models/evaluation-indicator';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {
  EvaluationIndicatorsPopupComponent
} from '../../../popups/evaluation-indicators-popup/evaluation-indicators-popup.component';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {SortEvent} from "@contracts/sort-event";
import {CommonUtils} from "@helpers/common-utils";

@Component({
  selector: 'evaluation-indicators',
  templateUrl: './evaluation-indicators.component.html',
  styleUrls: ['./evaluation-indicators.component.scss']
})
export class EvaluationIndicatorsComponent extends UiCrudListGenericComponent<EvaluationIndicator> {
  constructor() {
    super();
  }

  displayColumns: string[] = ['index', 'indicator', 'percentage', 'notes', 'actions'];
  actions: IMenuItem<EvaluationIndicator>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: EvaluationIndicator) => !this.readonly && this.edit$.next(item),
      show: (_item: EvaluationIndicator) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: EvaluationIndicator) => this.confirmDelete$.next(item),
      show: (_item: EvaluationIndicator) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: EvaluationIndicator) => this.view$.next(item),
    }
  ];
  sortingCallbacks = {
    indicator: (a: EvaluationIndicator, b: EvaluationIndicator, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.indicatorInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.indicatorInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  _getNewInstance(override?: Partial<EvaluationIndicator> | undefined): EvaluationIndicator {
    return new EvaluationIndicator().clone(override ? override : {});
  }

  _getDialogComponent(): ComponentType<any> {
    return EvaluationIndicatorsPopupComponent;
  }

  _getDeleteConfirmMessage(record: EvaluationIndicator): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.indicatorInfo?.getName()});
  }

  getExtraDataForPopup(): IKeyValue {
    return {};
  }
}
