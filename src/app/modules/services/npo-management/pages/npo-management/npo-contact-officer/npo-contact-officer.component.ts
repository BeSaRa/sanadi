import { Component, Input} from '@angular/core';
import { NpoContactOfficer } from "@app/models/npo-contact-officer";
import { NpoContactOfficerPopupComponent } from '../../../popups/npo-contact-officer-popup/npo-contact-officer-popup.component';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { UiCrudListGenericComponent } from '@app/generics/ui-crud-list-generic-component';
import { ComponentType } from '@angular/cdk/portal';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';

@Component({
  selector: 'npo-contact-officer',
  templateUrl: './npo-contact-officer.component.html',
  styleUrls: ['./npo-contact-officer.component.scss']
})
export class NpoContactOfficerComponent extends UiCrudListGenericComponent<NpoContactOfficer> {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  constructor(public lang: LangService,
    public toast: ToastService,
    public dialog: DialogService) {
  super();
  }

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
  displayColumns: string[] = ['idNumber', 'fullName', 'email', 'phone', 'extraPhone', 'actions'];

  _getNewInstance(override?: Partial<NpoContactOfficer> | undefined): NpoContactOfficer {
    return new NpoContactOfficer().clone(override ?? {});
  }
  _getDialogComponent(): ComponentType<any> {
    return NpoContactOfficerPopupComponent
  }
  _getDeleteConfirmMessage(record: NpoContactOfficer): string {
    return this.lang.map.msg_confirm_delete_x;
  }
  getExtraDataForPopup(): IKeyValue {
    return {};
  }
  @Input() contactOfficerList: NpoContactOfficer[] = [];
}
