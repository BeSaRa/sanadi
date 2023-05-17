import {Component} from '@angular/core';
import {ContactOfficer} from "@models/contact-officer";
import {ActionIconsEnum} from '@enums/action-icons-enum';
import {IMenuItem} from '@modules/context-menu/interfaces/i-menu-item';
import {ContactOfficerPopupComponent} from '../../popups/contact-officer-popup/contact-officer-popup.component';
import {UiCrudListGenericComponent} from '@app/generics/ui-crud-list-generic-component';
import {ComponentType} from '@angular/cdk/portal';
import {IKeyValue} from '@app/interfaces/i-key-value';

@Component({
  selector: 'contact-officer',
  templateUrl: './contact-officer.component.html',
  styleUrls: ['./contact-officer.component.scss']
})
export class ContactOfficerComponent extends UiCrudListGenericComponent<ContactOfficer> {

  constructor() {
    super();
  }

  displayColumns: string[] = ['arabicName', 'englishName', 'email', 'phone', 'passportNumber', 'actions'];
  actions: IMenuItem<ContactOfficer>[] = [
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: ContactOfficer) => this.edit$.next(item),
      show: (_item: ContactOfficer) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: ContactOfficer) => this.confirmDelete$.next(item),
      show: (_item: ContactOfficer) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: ContactOfficer) => this.view$.next(item),
    }
  ];

  _getNewInstance(override?: Partial<ContactOfficer> | undefined): ContactOfficer {
    return new ContactOfficer().clone(override ?? {});
  }

  _getDialogComponent(): ComponentType<any> {
    return ContactOfficerPopupComponent
  }

  _getDeleteConfirmMessage(record: ContactOfficer): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.getName()});
  }

  getExtraDataForPopup(): IKeyValue {
    return {};
  }
}
