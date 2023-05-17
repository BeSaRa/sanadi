import {Component} from '@angular/core';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {OrganizationOfficer} from '@app/models/organization-officer';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {
  UrgentJoinOrganizationOfficerPopupComponent
} from '../../popups/urgent-join-organization-officer-popup/urgent-join-organization-officer-popup.component';
import {UiCrudListGenericComponent} from '@app/generics/ui-crud-list-generic-component';
import {ComponentType} from '@angular/cdk/portal';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {EmployeeService} from "@services/employee.service";

@Component({
  selector: 'urgent-join-organization-officer',
  templateUrl: './urgent-join-organization-officer.component.html',
  styleUrls: ['./urgent-join-organization-officer.component.scss']
})
export class UrgentJoinOrganizationOfficerComponent extends UiCrudListGenericComponent<OrganizationOfficer> {

  constructor(private employeeService: EmployeeService) {
    super();
    this.isExternalUser = employeeService.isExternalUser();
  }

  displayColumns: string[] = ['fullName', 'identificationNumber', 'email', 'phone', 'extraPhone', 'actions'];
  actions: IMenuItem<OrganizationOfficer>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: OrganizationOfficer) => this.edit$.next(item),
      show: (_item: OrganizationOfficer) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: OrganizationOfficer) => this.confirmDelete$.next(item),
      show: (_item: OrganizationOfficer) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: OrganizationOfficer) => this.view$.next(item)
    }
  ];
  isExternalUser: boolean = false;

  _getNewInstance(override?: Partial<OrganizationOfficer> | undefined): OrganizationOfficer {
    return new OrganizationOfficer().clone(override ?? {});
  }

  _getDialogComponent(): ComponentType<any> {
    return UrgentJoinOrganizationOfficerPopupComponent
  }

  _getDeleteConfirmMessage(record: OrganizationOfficer): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.fullName});
  }

  getExtraDataForPopup(): IKeyValue {
    return {}
  }

}
