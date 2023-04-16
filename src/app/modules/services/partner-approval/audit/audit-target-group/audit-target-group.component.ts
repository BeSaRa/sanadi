import {Component, Input} from '@angular/core';
import {LangService} from '@services/lang.service';
import {CaseAuditService} from '@services/case-audit.service';
import {Goal} from '@models/goal';
import {AuditOperationTypes} from '@enums/audit-operation-types';
import {IMenuItem} from '@modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@enums/action-icons-enum';
import {Constants} from '@helpers/constants';
import {IFindInList} from '@contracts/i-find-in-list';
import {ObjectUtils} from '@helpers/object-utils';
import {IValueDifference} from '@contracts/i-value-difference';
import {AdminResult} from '@models/admin-result';
import {TargetGroup} from '@models/target-group';
import {AuditListGenericComponent} from '@app/generics/audit-list-generic-component';
import {CommonUtils} from '@helpers/common-utils';
import {BankAccount} from '@models/bank-account';
import {ControlValueLabelLangKey} from '@app/types/types';

@Component({
  selector: 'audit-target-group',
  templateUrl: './audit-target-group.component.html',
  styleUrls: ['./audit-target-group.component.scss']
})
export class AuditTargetGroupComponent extends AuditListGenericComponent<TargetGroup> {
  constructor(public lang: LangService,
              public caseAuditService: CaseAuditService) {
    super();
  }

  displayColumns: string[] = ['services', 'targetedGroup', 'actions'];
  actions: IMenuItem<TargetGroup>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<TargetGroup> | undefined): TargetGroup {
    if (CommonUtils.isValidValue(override)) {
      return new TargetGroup().clone(override)
    }
    return new TargetGroup();
  }

  getControlLabels(item: TargetGroup): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

  existsInList(objComparison: IFindInList<TargetGroup>): TargetGroup | undefined {
    return objComparison.listToCompareWith.find((item) => (
      item.services === objComparison.itemToCompare.services
      && item.targetedGroup === objComparison.itemToCompare.targetedGroup)
    );
  }
}
