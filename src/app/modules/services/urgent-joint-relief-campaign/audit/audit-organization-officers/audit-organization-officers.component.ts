import { ControlValueLabelLangKey } from './../../../../../types/types';
import { Component, OnInit } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { OrganizationOfficer } from '@app/models/organization-officer';

@Component({
  selector: 'audit-organization-officers',
  templateUrl: './audit-organization-officers.component.html',
  styleUrls: ['./audit-organization-officers.component.scss']
})
export class AuditOrganizationOfficersComponent extends AuditListGenericComponent<OrganizationOfficer> {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }

  displayColumns: string[] = ['fullName',
    'email',
    'phone',
    'extraPhone',
    'actions'];
  actions: IMenuItem<OrganizationOfficer>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<OrganizationOfficer> | undefined): OrganizationOfficer {
    if (CommonUtils.isValidValue(override)) {
      return new OrganizationOfficer().clone(override)
    }
    return new OrganizationOfficer();
  }

  getControlLabels(item: OrganizationOfficer): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

}
