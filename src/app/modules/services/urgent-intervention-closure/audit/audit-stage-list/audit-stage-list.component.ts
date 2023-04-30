import { ControlValueLabelLangKey } from './../../../../../types/types';
import { Component, Input, OnInit } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { Stage } from '@app/models/stage';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
  selector: 'audit-stage-list',
  templateUrl: './audit-stage-list.component.html',
  styleUrls: ['./audit-stage-list.component.scss']
})
export class AuditStageListComponent extends AuditListGenericComponent<Stage> {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }

  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  @Input()
  displayColumns: string[] = ['stage', 'duration', 'interventionCost', 'actions'];
  actions: IMenuItem<Stage>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<Stage> | undefined): Stage {
    if (CommonUtils.isValidValue(override)) {
      return new Stage().clone(override)
    }
    return new Stage();
  }

  getControlLabels(item: Stage): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }
}
