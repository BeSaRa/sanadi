import { ComponentType } from '@angular/cdk/portal';
import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { UiCrudListGenericComponent } from '@app/generics/ui-crud-list-generic-component';
import { EvaluationIndicator } from '@app/models/evaluation-indicator';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { EvaluationIndicatorsPopupComponent } from '../../../popups/evaluation-indicators-popup/evaluation-indicators-popup.component';
import { IKeyValue } from '@app/interfaces/i-key-value';

@Component({
  selector: 'evaluation-indicators',
  templateUrl: './evaluation-indicators.component.html',
  styleUrls: ['./evaluation-indicators.component.scss']
})
export class EvaluationIndicatorsComponent extends UiCrudListGenericComponent<EvaluationIndicator>  {
  constructor(public lang: LangService,
    public fb: UntypedFormBuilder,
    public dialog: DialogService,
    public toast: ToastService) {
  super();
  }
  displayColumns: string[] = ['index', 'indicator', 'percentage', 'notes', 'actions'];
  footerColumns: string[] = ['totalComponentCostLabel', 'totalComponentCost'];
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

  _getNewInstance(override?: Partial<EvaluationIndicator> | undefined): EvaluationIndicator {
    return new EvaluationIndicator().clone(override ? override : {});
  }

  _getDialogComponent(): ComponentType<any> {
    return EvaluationIndicatorsPopupComponent;
  }

  _getDeleteConfirmMessage(record: EvaluationIndicator): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.indicator});
  }

  getExtraDataForPopup(): IKeyValue {
    return {};
  }
}
