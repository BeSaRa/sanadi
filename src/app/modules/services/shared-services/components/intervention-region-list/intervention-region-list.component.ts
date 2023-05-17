import {Component} from '@angular/core';
import {InterventionRegion} from '@models/intervention-region';
import {UiCrudListGenericComponent} from '@app/generics/ui-crud-list-generic-component';
import {ComponentType} from '@angular/cdk/portal';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {
  InterventionRegionListPopupComponent
} from '../../popups/intervention-region-list-popup/intervention-region-list-popup.component';

@Component({
  selector: 'intervention-region-list',
  templateUrl: './intervention-region-list.component.html',
  styleUrls: ['./intervention-region-list.component.scss']
})
export class InterventionRegionListComponent extends UiCrudListGenericComponent<InterventionRegion> {

  constructor() {
    super();
  }

  displayColumns = ['region', 'description', 'actions'];
  actions: IMenuItem<InterventionRegion>[] = [
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: InterventionRegion) => this.edit$.next(item),
      show: (_item: InterventionRegion) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: InterventionRegion) => this.confirmDelete$.next(item),
      show: (_item: InterventionRegion) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: InterventionRegion) => this.view$.next(item),
      show: (_item: InterventionRegion) => this.readonly
    }
  ];

  _getNewInstance(override?: Partial<InterventionRegion> | undefined): InterventionRegion {
    return new InterventionRegion().clone(override ?? {});
  }

  _getDialogComponent(): ComponentType<any> {
    return InterventionRegionListPopupComponent;
  }

  _getDeleteConfirmMessage(record: InterventionRegion): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.region});
  }

  getExtraDataForPopup(): IKeyValue {
    return {}
  }

}
