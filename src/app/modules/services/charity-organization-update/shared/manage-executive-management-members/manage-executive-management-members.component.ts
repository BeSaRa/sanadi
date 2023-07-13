import { OrgMember } from '@app/models/org-member';
import {Component, inject, Input} from '@angular/core';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {UiCrudListGenericComponent} from "@app/generics/ui-crud-list-generic-component";
import {EmployeeService} from "@services/employee.service";
import {IMenuItem} from "@modules/context-menu/interfaces/i-menu-item";
import {ActionIconsEnum} from "@enums/action-icons-enum";
import {ComponentType} from "@angular/cdk/portal";
import {IKeyValue} from "@contracts/i-key-value";
import { ManageMembersPopupComponent } from '@app/modules/services/general-association-meeting-attendance/popups/manage-members-popup/manage-members-popup.component';
import { ManageExecutiveManagementMembersPopupComponent } from '../../popups/manage-executive-management-members-popup/manage-executive-management-members-popup.component';


@Component({
  selector: 'manage-executive-management-members',
  templateUrl: './manage-executive-management-members.component.html',
  styleUrls: ['./manage-executive-management-members.component.scss']
})
export class ManageExecutiveManagementMembersComponent extends UiCrudListGenericComponent<OrgMember> {
  @Input() addLabel!: keyof ILanguageKeys;

  constructor() {
    super();
  }

  displayColumns: string[] = ['index', 'identificationNumber', 'fullName', 'workStartDate', 'jobTitle', 'actions'];
  actions: IMenuItem<OrgMember>[] = [
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: OrgMember) => this.confirmDelete$.next(item),
      show: (item: OrgMember) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: OrgMember) => this.view$.next(item),
    }
  ];

  _getNewInstance(override?: Partial<OrgMember> | undefined): OrgMember {
    return new OrgMember().clone(override ?? {});
  };

  _getDialogComponent(): ComponentType<any> {
    return ManageExecutiveManagementMembersPopupComponent;
  };

  _getDeleteConfirmMessage(record: OrgMember): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.fullName});
  };

  getExtraDataForPopup(): IKeyValue {
    return {
      addLabel: this.addLabel
    }
  }
}
