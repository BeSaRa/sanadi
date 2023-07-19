import {Component, Input} from '@angular/core';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {UiCrudListGenericComponent} from "@app/generics/ui-crud-list-generic-component";
import {IMenuItem} from "@modules/context-menu/interfaces/i-menu-item";
import {ActionIconsEnum} from "@enums/action-icons-enum";
import {ComponentType} from "@angular/cdk/portal";
import {IKeyValue} from "@contracts/i-key-value";
import { ManageExecutiveManagementMembersPopupComponent } from '../../popups/manage-executive-management-members-popup/manage-executive-management-members-popup.component';
import { OrgExecutiveMember } from '@app/models/org-executive-member';


@Component({
  selector: 'manage-executive-management-members',
  templateUrl: './manage-executive-management-members.component.html',
  styleUrls: ['./manage-executive-management-members.component.scss']
})
export class ManageExecutiveManagementMembersComponent extends UiCrudListGenericComponent<OrgExecutiveMember> {
  @Input() addLabel!: keyof ILanguageKeys;

  constructor() {
    super();
  }

  displayColumns: string[] = ['index', 'identificationNumber', 'fullName', 'workStartDate', 'jobTitle', 'actions'];
  actions: IMenuItem<OrgExecutiveMember>[] = [
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: OrgExecutiveMember) => this.confirmDelete$.next(item),
      show: (item: OrgExecutiveMember) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: OrgExecutiveMember) => this.view$.next(item),
    }
  ];

  _getNewInstance(override?: Partial<OrgExecutiveMember> | undefined): OrgExecutiveMember {
    return new OrgExecutiveMember().clone(override ?? {});
  };

  _getDialogComponent(): ComponentType<any> {
    return ManageExecutiveManagementMembersPopupComponent;
  };

  _getDeleteConfirmMessage(record: OrgExecutiveMember): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.fullName});
  };

  getExtraDataForPopup(): IKeyValue {
    return {
      addLabel: this.addLabel
    }
  }
}
