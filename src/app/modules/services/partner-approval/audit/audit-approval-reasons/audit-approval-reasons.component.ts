import {Component} from '@angular/core';
import {AuditListGenericComponent} from '@app/generics/audit-list-generic-component';
import {LangService} from '@services/lang.service';
import {CaseAuditService} from '@services/case-audit.service';
import {IMenuItem} from '@modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@enums/action-icons-enum';
import {AuditOperationTypes} from '@enums/audit-operation-types';
import {CommonUtils} from '@helpers/common-utils';
import {ControlValueLabelLangKey} from '@app/types/types';
import {ApprovalReason} from '@models/approval-reason';
import {IFindInList} from '@contracts/i-find-in-list';

@Component({
  selector: 'audit-approval-reasons',
  templateUrl: './audit-approval-reasons.component.html',
  styleUrls: ['./audit-approval-reasons.component.scss']
})
export class AuditApprovalReasonsComponent extends AuditListGenericComponent<ApprovalReason> {
  constructor(public lang: LangService,
              public caseAuditService: CaseAuditService) {
    super();
  }

  displayColumns: string[] = ['projects', 'research', 'fieldVisit', 'actions'];
  actions: IMenuItem<ApprovalReason>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<ApprovalReason> | undefined): ApprovalReason {
    if (CommonUtils.isValidValue(override)) {
      return new ApprovalReason().clone(override)
    }
    return new ApprovalReason();
  }

  getControlLabels(item: ApprovalReason): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

  existsInList(objComparison: IFindInList<ApprovalReason>): ApprovalReason | undefined {
    return objComparison.listToCompareWith.find((item) => (
      item.projects === objComparison.itemToCompare.projects
      && item.fieldVisit === objComparison.itemToCompare.fieldVisit
      && item.research === objComparison.itemToCompare.research)
    );
  }

}
