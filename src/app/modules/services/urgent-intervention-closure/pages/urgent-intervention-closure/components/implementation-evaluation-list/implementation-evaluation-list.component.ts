import { LangService } from '@services/lang.service';
import { ToastService } from '@services/toast.service';
import { DialogService } from '@services/dialog.service';
import { IMenuItem } from '@modules/context-menu/interfaces/i-menu-item';
import { ActionIconsEnum } from '@enums/action-icons-enum';
import { OfficeEvaluation } from '@models/office-evaluation';
import { UiCrudListGenericComponent } from '@app/generics/ui-crud-list-generic-component';
import { ComponentType } from '@angular/cdk/portal';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { Component } from '@angular/core';
import { CommonUtils } from '@app/helpers/common-utils';
import { SortEvent } from '@app/interfaces/sort-event';
import { ImplementationEvaluationPopupComponent } from '@app/modules/services/urgent-intervention-closure/popups/implementation-evaluation-popup/implementation-evaluation-popup.component';

@Component({
  selector: 'implementation-evaluation-list',
  templateUrl: './implementation-evaluation-list.component.html',
  styleUrls: ['./implementation-evaluation-list.component.scss']
})
export class ImplementationEvaluationListComponent extends UiCrudListGenericComponent<OfficeEvaluation>{
  actions: IMenuItem<OfficeEvaluation>[] = [
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: OfficeEvaluation) => this.edit$.next(item),
      show: (_item: OfficeEvaluation) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: OfficeEvaluation) => this.confirmDelete$.next(item),
      show: (_item: OfficeEvaluation) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: OfficeEvaluation) => this.view$.next(item),
      show: (_item: OfficeEvaluation) => this.readonly
    }
  ];

  displayColumns = ['evaluationHub', 'evaluationResult', 'notes', 'actions'];
  constructor(public lang: LangService,
    public toast: ToastService,
    public dialog: DialogService) {
    super();
  }
  _getNewInstance(override?: Partial<OfficeEvaluation> | undefined): OfficeEvaluation {
    return new OfficeEvaluation().clone(override ?? {});
  }
  _getDialogComponent(): ComponentType<any> {
    return ImplementationEvaluationPopupComponent;
  }
  _getDeleteConfirmMessage(record: OfficeEvaluation): string {
    return this.lang.map.msg_confirm_delete_selected
  }
  getExtraDataForPopup(): IKeyValue {
    return {}
  }

  sortingCallbacks = {
    evaluationHub: (a: OfficeEvaluation, b: OfficeEvaluation, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.evaluationHubInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.evaluationHubInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    evaluationResult: (a: OfficeEvaluation, b: OfficeEvaluation, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.evaluationResultInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.evaluationResultInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  };
}
