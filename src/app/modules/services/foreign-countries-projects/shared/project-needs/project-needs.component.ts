import { Component, Input } from '@angular/core';
import { ProjectNeed, ProjectNeeds } from '@models/project-needs';
import { DialogService } from '@services/dialog.service';
import { LangService } from '@services/lang.service';
import { ToastService } from '@services/toast.service';
import { CustomValidators } from '@app/validators/custom-validators';
import { ProjectNeedsPopupComponent } from '../../popups/project-needs-popup/project-needs-popup.component';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { UiCrudListGenericComponent } from '@app/generics/ui-crud-list-generic-component';
import { ComponentType } from '@angular/cdk/portal';
import { IKeyValue } from '@app/interfaces/i-key-value';

@Component({
  selector: 'project-needs',
  templateUrl: './project-needs.component.html',
  styleUrls: ['./project-needs.component.scss'],
})
export class ProjectNeedsComponent extends UiCrudListGenericComponent<ProjectNeed> {
  @Input() projectNeedsList: ProjectNeeds = [];
  actions: IMenuItem<ProjectNeed>[] = [
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: ProjectNeed) => this.edit$.next(item),
      show: (_item: ProjectNeed) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: ProjectNeed) => this.confirmDelete$.next(item),
      show: (_item: ProjectNeed) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: ProjectNeed) => this.view$.next(item),
    }
  ];
  displayColumns: string[] = ['projectName', 'projectDescription', 'beneficiaries', 'goals', 'totalCost', 'actions'];
  footerColumns: string[] = ['totalCostFooterLabel', 'totalCostFooter'];
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  _getNewInstance(override?: Partial<ProjectNeed> | undefined): ProjectNeed {
    return new ProjectNeed().clone(override ?? {});
  }
  _getDialogComponent(): ComponentType<any> {
    return ProjectNeedsPopupComponent;
  }
  _getDeleteConfirmMessage(record: ProjectNeed): string {
    return this.lang.map.msg_confirm_delete_x
  }
  getExtraDataForPopup(): IKeyValue {
    return {}
  }
  calculateTotalCost(): number {
    if (!this.list || this.list.length === 0) {
      return 0;
    } else {
      return this.list.map(x => {
        if (!x.totalCost) {
          return 0;
        }
        return Number(Number(x.totalCost).toFixed(2));
      }).reduce((resultSum, a) => resultSum + a, 0);
    }
  }
  @Input() projectNeedList: ProjectNeed[] = [];
  constructor(public lang: LangService,
    public toast: ToastService,
    public dialog: DialogService) {
    super();
  }
}
