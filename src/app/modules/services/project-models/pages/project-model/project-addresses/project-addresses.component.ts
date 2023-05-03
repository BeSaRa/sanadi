import { ComponentType } from '@angular/cdk/portal';
import { Component } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { UiCrudListGenericComponent } from '@app/generics/ui-crud-list-generic-component';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { CollectionItem } from '@app/models/collection-item';
import { ProjectAddress } from '@app/models/project-address';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { ProjectAddressesPopupComponent } from '../../../popups/project-addresses-popup/project-addresses-popup.component';

@Component({
  selector: 'project-addresses',
  templateUrl: './project-addresses.component.html',
  styleUrls: ['./project-addresses.component.scss']
})
export class ProjectAddressesComponent extends UiCrudListGenericComponent<ProjectAddress> {
  constructor(public lang: LangService,
              public toast: ToastService,
              public dialog: DialogService) {
    super();
  }
  actions: IMenuItem<ProjectAddress>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: ProjectAddress) => !this.readonly && this.edit$.next(item),
      show: (_item: ProjectAddress) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: ProjectAddress) => this.confirmDelete$.next(item),
      show: (_item: ProjectAddress) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: ProjectAddress) => this.view$.next(item),
    }
  ];
  displayColumns: string[] = ['index', 'beneficiaryRegion', 'address', 'location', 'actions'];
  
  _getDialogComponent(): ComponentType<any> {
    return ProjectAddressesPopupComponent;
  }

  _getNewInstance(override: Partial<ProjectAddress> | undefined): ProjectAddress {
    return new ProjectAddress().clone(override ?? {});
  }

  _getDeleteConfirmMessage(record: ProjectAddress): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.address});
  }

  getExtraDataForPopup(): IKeyValue {
    return {
    };
  }

  openLocationMap(item: CollectionItem) {
    item.openMap(true);
  }
}
