import {Component} from '@angular/core';
import {NpoContactOfficer} from "@app/models/npo-contact-officer";
import {
  NpoContactOfficerPopupComponent
} from '@modules/services/npo-management/popups/npo-contact-officer-popup/npo-contact-officer-popup.component';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {UiCrudListGenericComponent} from '@app/generics/ui-crud-list-generic-component';
import {ComponentType} from '@angular/cdk/portal';
import {IKeyValue} from '@app/interfaces/i-key-value';

@Component({
  selector: 'npo-contact-officer',
  templateUrl: './npo-contact-officer.component.html',
  styleUrls: ['./npo-contact-officer.component.scss']
})
export class NpoContactOfficerComponent extends UiCrudListGenericComponent<NpoContactOfficer> {
  constructor() {
    super();
  }

  displayColumns: string[] = ['identificationNumber', 'fullName', 'email', 'phone', 'extraPhone', 'actions'];
  actions: IMenuItem<NpoContactOfficer>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: NpoContactOfficer) => this.edit$.next(item),
      show: (_item: NpoContactOfficer) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: NpoContactOfficer) => this.confirmDelete$.next(item),
      show: (_item: NpoContactOfficer) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: NpoContactOfficer) => this.view$.next(item),
    }
  ];

  _getNewInstance(override?: Partial<NpoContactOfficer> | undefined): NpoContactOfficer {
    return new NpoContactOfficer().clone(override ?? {});
  }

  _getDialogComponent(): ComponentType<any> {
    return NpoContactOfficerPopupComponent
  }

  _getDeleteConfirmMessage(record: NpoContactOfficer): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.fullName});
  }

  getExtraDataForPopup(): IKeyValue {
    return {};
  }
}
