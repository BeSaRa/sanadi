import { Component, Input } from '@angular/core';
import { LangService } from "@services/lang.service";
import { ToastService } from "@services/toast.service";
import { DialogService } from "@services/dialog.service";
import { ContactOfficer } from "@models/contact-officer";
import { ActionIconsEnum } from '@enums/action-icons-enum';
import { IMenuItem } from '@modules/context-menu/interfaces/i-menu-item';
import { ContactOfficerPopupComponent } from '../../popups/contact-officer-popup/contact-officer-popup.component';
import { UiCrudListGenericComponent } from '@app/generics/ui-crud-list-generic-component';
import { ComponentType } from '@angular/cdk/portal';
import { IKeyValue } from '@app/interfaces/i-key-value';

@Component({
  selector: 'contact-officer',
  templateUrl: './contact-officer.component.html',
  styleUrls: ['./contact-officer.component.scss']
})
export class ContactOfficerComponent extends UiCrudListGenericComponent<ContactOfficer>  {
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

  displayColumns: string[] =['arabicName', 'englishName', 'email', 'phone', 'passportNumber', 'actions'];
  
  _getNewInstance(override?: Partial<ContactOfficer> | undefined): ContactOfficer {
    return new ContactOfficer().clone(override ?? {});
  }
  _getDialogComponent(): ComponentType<any> {
    return ContactOfficerPopupComponent
  }
  _getDeleteConfirmMessage(record: ContactOfficer): string {
    return this.lang.map.msg_confirm_delete_x;
  }
  getExtraDataForPopup(): IKeyValue {
    return {};
  }
  constructor(public lang: LangService,
    public toast: ToastService,
    public dialog: DialogService) {
    super();
  }
  @Input() contactOfficerList: ContactOfficer[] = [];
}
