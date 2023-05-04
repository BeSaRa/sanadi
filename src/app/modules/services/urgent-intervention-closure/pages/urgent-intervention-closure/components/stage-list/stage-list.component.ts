import { Stage } from '@models/stage';
import { UiCrudListGenericComponent } from '@app/generics/ui-crud-list-generic-component';
import { Component } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { DialogService } from '@app/services/dialog.service';
import { StageListPopupComponent } from '@app/modules/services/urgent-intervention-closure/popups/stage-list-popup/stage-list-popup.component';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
  selector: 'stage-list',
  templateUrl: './stage-list.component.html',
  styleUrls: ['./stage-list.component.scss']
})
export class StageListComponent extends UiCrudListGenericComponent<Stage>{
  actions: IMenuItem<Stage>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: Stage) => this.edit$.next(item),
      show: (_item: Stage) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: Stage) => this.confirmDelete$.next(item),
      show: (_item: Stage) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: Stage) => this.view$.next(item),
      show: (_item: Stage) => this.readonly
    }
  ];

  totalInterventionCost: number = 0;
  displayColumns = ['stage', 'duration', 'interventionCost', 'actions'];
  footerColumns: string[] = ['totalInterventionCostLabel', 'totalInterventionCost'];
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  constructor(public lang: LangService,
    public toast: ToastService,
    public dialog: DialogService) {
    super();
  }
  _getNewInstance(override?: Partial<Stage> | undefined): Stage {
    return new Stage().clone(override ?? {});
  }
  _getDialogComponent(): ComponentType<any> {
    return StageListPopupComponent;
  }
  _getDeleteConfirmMessage(record: Stage): string {
    return this.lang.map.msg_confirm_delete_selected
  }
  getExtraDataForPopup(): IKeyValue {
    return {}
  }
  calculateTotalInterventionCost(): number {
    let total: number;
    if (!this.list || this.list.length === 0) {
      total = 0;
    } else {
      total = this.list.map(x => {
        if (!x.interventionCost) {
          return 0;
        }
        return Number(Number(x.interventionCost).toFixed(2));
      }).reduce((resultSum, a) => resultSum + a, 0);
    }
    return this.totalInterventionCost = total;
  }

}
