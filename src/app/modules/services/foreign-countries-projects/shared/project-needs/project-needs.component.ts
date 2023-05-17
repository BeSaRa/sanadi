import {Component} from '@angular/core';
import {ProjectNeed} from '@models/project-needs';
import {ProjectNeedsPopupComponent} from '../../popups/project-needs-popup/project-needs-popup.component';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {UiCrudListGenericComponent} from '@app/generics/ui-crud-list-generic-component';
import {ComponentType} from '@angular/cdk/portal';
import {IKeyValue} from '@app/interfaces/i-key-value';

@Component({
  selector: 'project-needs',
  templateUrl: './project-needs.component.html',
  styleUrls: ['./project-needs.component.scss'],
})
export class ProjectNeedsComponent extends UiCrudListGenericComponent<ProjectNeed> {

  constructor() {
    super();
  }

  displayColumns: string[] = ['projectName', 'projectDescription', 'beneficiaries', 'goals', 'totalCost', 'actions'];
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
  footerColumns: string[] = ['totalCostFooterLabel', 'totalCostFooter'];

  _getNewInstance(override?: Partial<ProjectNeed> | undefined): ProjectNeed {
    return new ProjectNeed().clone(override ?? {});
  }

  _getDialogComponent(): ComponentType<any> {
    return ProjectNeedsPopupComponent;
  }

  _getDeleteConfirmMessage(record: ProjectNeed): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.projectName})
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
}
