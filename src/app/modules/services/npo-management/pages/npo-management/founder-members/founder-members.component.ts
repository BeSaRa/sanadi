import { Component, Input } from '@angular/core';
import { LangService } from "@app/services/lang.service";
import { ToastService } from "@app/services/toast.service";
import { DialogService } from "@app/services/dialog.service";
import { FounderMembers } from "@app/models/founder-members";
import { FounderMembersPopupComponent } from '../../../popups/founder-members-popup/founder-members-popup.component';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { UiCrudListGenericComponent } from '@app/generics/ui-crud-list-generic-component';
import { ComponentType } from '@angular/cdk/portal';
import { IKeyValue } from '@app/interfaces/i-key-value';

@Component({
  selector: 'founder-members',
  templateUrl: './founder-members.component.html',
  styleUrls: ['./founder-members.component.scss']
})
export class FounderMembersComponent extends UiCrudListGenericComponent<FounderMembers> {
  
  displayColumns: string[] = ['idNumber', 'fullName', 'email', 'phone', 'extraPhone', 'actions'];

  actions: IMenuItem<FounderMembers>[] = [
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: FounderMembers) => this.edit$.next(item),
      show: (_item: FounderMembers) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: FounderMembers) => this.confirmDelete$.next(item),
      show: (_item: FounderMembers) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: FounderMembers) => this.view$.next(item),
    }
  ];

  @Input() founderMemberList: FounderMembers[] = [];

  constructor(
    public lang: LangService,
    public toast: ToastService,
    public dialog: DialogService
    ) {
    super();
  }

  _getNewInstance(override?: Partial<FounderMembers> | undefined): FounderMembers {
    return new FounderMembers().clone(override ?? {});
  }

  _getDialogComponent(): ComponentType<any> {
    return FounderMembersPopupComponent
  }

  _getDeleteConfirmMessage(record: FounderMembers): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.fullName});
  }

  getExtraDataForPopup(): IKeyValue {
    return {};
  }

}
