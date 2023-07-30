import {Component} from '@angular/core';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {AuditOperationTypes} from '@app/enums/audit-operation-types';
import {AuditListGenericComponent} from '@app/generics/audit-list-generic-component';
import {CommonUtils} from '@app/helpers/common-utils';
import {EvaluationIndicator} from '@app/models/evaluation-indicator';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {CaseAuditService} from '@app/services/case-audit.service';
import {LangService} from '@app/services/lang.service';
import {ControlValueLabelLangKey} from '@app/types/types';

@Component({
    selector: 'audit-evaluation-indicator',
    templateUrl: 'audit-evaluation-indicator.component.html',
    styleUrls: ['audit-evaluation-indicator.component.scss']
})
export class AuditEvaluationIndicatorComponent extends AuditListGenericComponent<EvaluationIndicator> {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }

  displayColumns: string[] = ['indicator', 'notes', 'actions'];
  actions: IMenuItem<EvaluationIndicator>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<EvaluationIndicator> | undefined): EvaluationIndicator {
    if (CommonUtils.isValidValue(override)) {
      return new EvaluationIndicator().clone(override)
    }
    return new EvaluationIndicator();
  }

  getControlLabels(item: EvaluationIndicator): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }
}
