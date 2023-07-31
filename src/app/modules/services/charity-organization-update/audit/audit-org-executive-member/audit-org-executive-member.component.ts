import { Component } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IFindInList } from '@app/interfaces/i-find-in-list';
import { OrgExecutiveMember } from '@app/models/org-executive-member';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { ControlValueLabelLangKey } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
    selector: 'audit-org-executive-member',
    templateUrl: 'audit-org-executive-member.component.html',
    styleUrls: ['audit-org-executive-member.component.scss']
})
export class AuditOrgExecutiveMemberComponent extends AuditListGenericComponent<OrgExecutiveMember> {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  displayColumns: string[] = ['fullName', 'identificationNumber','joinDate', 'email', 'phone', 'jobTitle'];
  actions: IMenuItem<OrgExecutiveMember>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<OrgExecutiveMember> | undefined): OrgExecutiveMember {
    if (CommonUtils.isValidValue(override)) {
      return new OrgExecutiveMember().clone(override)
    }
    return new OrgExecutiveMember();
  }

  getControlLabels(item: OrgExecutiveMember): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }
}

