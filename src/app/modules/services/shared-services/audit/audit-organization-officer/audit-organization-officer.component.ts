import { Component } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IFindInList } from '@app/interfaces/i-find-in-list';
import { OrganizationOfficer } from '@app/models/organization-officer';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { ControlValueLabelLangKey } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
    selector: 'audit-organization-officer',
    templateUrl: 'audit-organization-officer.component.html',
    styleUrls: ['audit-organization-officer.component.scss']
})
export class AuditOrganizationOfficerComponent extends AuditListGenericComponent<OrganizationOfficer> {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  displayColumns: string[] = [
    'fullName',
    'email',
    'phone',
    'extraPhone',
    'actions',
    ];
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

  existsInList(objComparison: IFindInList<OrganizationOfficer>): OrganizationOfficer | undefined {
    return objComparison.listToCompareWith.find((item) => item.organizationId === objComparison.itemToCompare.organizationId);
  }
}
