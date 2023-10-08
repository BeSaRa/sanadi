import { Component, Input, OnInit } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IFindInList } from '@app/interfaces/i-find-in-list';
import { FounderMembers } from '@app/models/founder-members';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { ControlValueLabelLangKey } from '@app/types/types';

@Component({
  selector: 'audit-founder-members',
  templateUrl: './audit-founder-members.component.html',
  styleUrls: ['./audit-founder-members.component.scss']
})
export class AuditFounderMembersComponent extends AuditListGenericComponent<FounderMembers> {

  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }

  @Input()
  displayColumns: string[] = ['idNumber', 'fullName', 'email', 'phone', 'extraPhone', 'actions'];
  actions: IMenuItem<FounderMembers>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<FounderMembers> | undefined): FounderMembers {
    if (CommonUtils.isValidValue(override)) {
      return new FounderMembers().clone(override)
    }
    return new FounderMembers();
  }

  getControlLabels(item: FounderMembers): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

  existsInList(objComparison: IFindInList<FounderMembers>): FounderMembers | undefined {
    return objComparison.listToCompareWith.find((item) => item.identificationNumber === objComparison.itemToCompare.identificationNumber && item.itemId === objComparison.itemToCompare.itemId);
  }
}
