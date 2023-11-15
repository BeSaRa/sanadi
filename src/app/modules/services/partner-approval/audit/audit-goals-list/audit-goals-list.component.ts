import {AfterViewInit, Component, Input} from '@angular/core';
import {AuditOperationTypes} from '@enums/audit-operation-types';
import {LangService} from '@services/lang.service';
import {CaseAuditService} from '@services/case-audit.service';
import {Constants} from '@helpers/constants';
import {IMenuItem} from '@modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@enums/action-icons-enum';
import {ObjectUtils} from '@helpers/object-utils';
import {IValueDifference} from '@contracts/i-value-difference';
import {AdminResult} from '@models/admin-result';
import {GoalList} from '@models/goal-list';
import {IFindInList} from '@contracts/i-find-in-list';
import {Goal} from '@models/goal';
import {AuditListGenericComponent} from '@app/generics/audit-list-generic-component';
import {CommonUtils} from '@helpers/common-utils';
import {ControlValueLabelLangKey} from '@app/types/types';

@Component({
  selector: 'audit-goals-list',
  templateUrl: './audit-goals-list.component.html',
  styleUrls: ['./audit-goals-list.component.scss']
})
export class AuditGoalsListComponent extends AuditListGenericComponent<GoalList> {
  constructor(public lang: LangService,
              public caseAuditService: CaseAuditService) {
    super();
  }

  displayColumns: string[] = ['domain', 'mainDACCategory', 'mainUNOCHACategory', 'actions'];
  actions: IMenuItem<GoalList>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item)
    }
  ];

  _getNewInstance(override: Partial<GoalList> | undefined): GoalList {
    if (CommonUtils.isValidValue(override)) {
      return new GoalList().clone(override)
    }
    return new GoalList();
  }

  getControlLabels(item: GoalList): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }
}
