import {AfterViewInit, Component, Input} from '@angular/core';
import {Goal} from '@models/goal';
import {AuditOperationTypes} from '@enums/audit-operation-types';
import {LangService} from '@services/lang.service';
import {Constants} from '@helpers/constants';
import {IMenuItem} from '@modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@enums/action-icons-enum';
import {ObjectUtils} from '@helpers/object-utils';
import {IValueDifference} from '@contracts/i-value-difference';
import {AdminResult} from '@models/admin-result';
import {CaseAuditService} from '@services/case-audit.service';
import {IFindInList} from '@contracts/i-find-in-list';
import {AuditListGenericComponent} from '@app/generics/audit-list-generic-component';
import {CommonUtils} from '@helpers/common-utils';
import {BankAccount} from '@models/bank-account';
import {ControlValueLabelLangKey} from '@app/types/types';
import {CaseTypes} from '@enums/case-types.enum';

@Component({
  selector: 'audit-goals',
  templateUrl: './audit-goals.component.html',
  styleUrls: ['./audit-goals.component.scss']
})
export class AuditGoalsComponent extends AuditListGenericComponent<Goal> {
  constructor(public lang: LangService,
              public caseAuditService: CaseAuditService) {
    super();
  }

  displayColumns: string[] = ['goal', 'actions'];
  actions: IMenuItem<Goal>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<Goal> | undefined): Goal {
    if (CommonUtils.isValidValue(override)) {
      return new Goal().clone(override)
    }
    return new Goal();
  }

  getControlLabels(item: Goal): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }
}
