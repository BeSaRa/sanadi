import {ControlValueLabelLangKey} from '@app/types/types';
import {Component} from '@angular/core';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {AuditOperationTypes} from '@app/enums/audit-operation-types';
import {AuditListGenericComponent} from '@app/generics/audit-list-generic-component';
import {CommonUtils} from '@app/helpers/common-utils';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {CaseAuditService} from '@app/services/case-audit.service';
import {LangService} from '@app/services/lang.service';
import {BestPractices} from '@app/models/best-practices';

@Component({
  selector: 'audit-best-practices-list',
  templateUrl: './audit-best-practices-list.component.html',
  styleUrls: ['./audit-best-practices-list.component.scss']
})
export class AuditBestPracticesListComponent extends AuditListGenericComponent<BestPractices> {
  constructor(public lang: LangService,
              public caseAuditService: CaseAuditService) {
    super();
  }

  displayColumns: string[] = ['bestPracticesListString', 'statement', 'actions'];
  actions: IMenuItem<BestPractices>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<BestPractices> | undefined): BestPractices {
    if (CommonUtils.isValidValue(override)) {
      return new BestPractices().clone(override)
    }
    return new BestPractices();
  }

  getControlLabels(item: BestPractices): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

}
