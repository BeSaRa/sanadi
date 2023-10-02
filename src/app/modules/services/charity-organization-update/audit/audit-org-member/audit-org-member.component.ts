import { IFindInList } from '@app/interfaces/i-find-in-list';
import { Component } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { OrgMember } from '@app/models/org-member';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { ControlValueLabelLangKey } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
  selector: 'audit-org-member',
  templateUrl: 'audit-org-member.component.html',
  styleUrls: ['audit-org-member.component.scss']
})
export class AuditOrgMemberComponent extends AuditListGenericComponent<OrgMember> {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  displayColumns: string[] = ['fullName', 'identificationNumber', 'joinDate', 'email', 'phone', 'jobTitle', 'actions'];
  actions: IMenuItem<OrgMember>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<OrgMember> | undefined): OrgMember {
    if (CommonUtils.isValidValue(override)) {
      return new OrgMember().clone(override)
    }
    return new OrgMember();
  }

  getControlLabels(item: OrgMember): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }
  existsInList(objComparison: IFindInList<OrgMember>): OrgMember | undefined {
    return objComparison.listToCompareWith.find((item) => item.identificationNumber === objComparison.itemToCompare.identificationNumber && item.itemId === objComparison.itemToCompare.itemId);
  }
}

