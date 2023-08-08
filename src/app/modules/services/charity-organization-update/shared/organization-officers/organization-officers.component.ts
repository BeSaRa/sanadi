import { ComponentType } from '@angular/cdk/portal';
import { IKeyValue } from '@contracts/i-key-value';
import { UiCrudListGenericComponent } from '@app/generics/ui-crud-list-generic-component';
import { ILanguageKeys } from '@contracts/i-language-keys';
import { Component, Input } from '@angular/core';
import { OrganizationOfficer } from '@models/organization-officer';
import { OrganizationOfficerPopupComponent } from '../../popups/organization-officer-popup/organization-officer-popup.component';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';

@Component({
  selector: 'organization-officers',
  templateUrl: './organization-officers.component.html',
  styleUrls: ['./organization-officers.component.scss']
})
export class OrganizationOfficersComponent extends UiCrudListGenericComponent<OrganizationOfficer> {
  @Input() label!: string;
  get _label() {
    return this.label as keyof ILanguageKeys
  }
  constructor() {
    super();
  }

  displayColumns: string[] = [
    'fullName',
    'identificationNumber',
    'email',
    'phoneNumber',
    'extraPhoneNumber',
    'actions',
  ];
  actions: IMenuItem<OrganizationOfficer>[] = [
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: OrganizationOfficer) => this.edit$.next(item),
      show: (_item: OrganizationOfficer) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: OrganizationOfficer) => this.confirmDelete$.next(item),
      show: (_item: OrganizationOfficer) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: OrganizationOfficer) => this.view$.next(item),
    }
  ];

  _getNewInstance(override?: Partial<OrganizationOfficer> | undefined): OrganizationOfficer {
    return new OrganizationOfficer().clone(override ?? {});
  };

  _getDialogComponent(): ComponentType<any> {
    return OrganizationOfficerPopupComponent;
  };

  _getDeleteConfirmMessage(record: OrganizationOfficer): string {
    return this.lang.map.msg_confirm_delete_x.change({ x: record.fullName });
  };

  getExtraDataForPopup(): IKeyValue {
    return {
      label: this.label,
    }
  }
}
