import { ControlValueLabelLangKey } from './../../../../../types/types';
import { Component, Input, OnInit } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { OfficeEvaluation } from '@app/models/office-evaluation';

@Component({
  selector: 'audit-implementation-evaluation-list',
  templateUrl: './audit-implementation-evaluation-list.component.html',
  styleUrls: ['./audit-implementation-evaluation-list.component.scss']
})
export class AuditImplementationEvaluationListComponent extends AuditListGenericComponent<OfficeEvaluation> {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }

  @Input()
  displayColumns: string[] = ['evaluationHub', 'evaluationResult' ,'notes', 'actions'];
  actions: IMenuItem<OfficeEvaluation>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<OfficeEvaluation> | undefined): OfficeEvaluation {
    if (CommonUtils.isValidValue(override)) {
      return new OfficeEvaluation().clone(override)
    }
    return new OfficeEvaluation();
  }

  getControlLabels(item: OfficeEvaluation): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }
}
