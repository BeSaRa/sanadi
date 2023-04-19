import { FinancialTransfersProject } from '@app/models/financial-transfers-project';
import { Component } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { ControlValueLabelLangKey } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
    selector: 'audit-financial-transfers-projects',
    templateUrl: 'audit-financial-transfers-projects.component.html',
    styleUrls: ['audit-financial-transfers-projects.component.scss']
})
export class AuditFinancialTransfersProjectsComponent extends AuditListGenericComponent<FinancialTransfersProject> {
  constructor(public lang: LangService,
              public caseAuditService: CaseAuditService) {
    super();
  }
  inputMaskPatterns = CustomValidators.inputMaskPatterns

  displayColumns: string[] = [
    'fullSerial',
    'qatariTransactionAmount',
    'notes',
    'actions',
  ];
  actions: IMenuItem<FinancialTransfersProject>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<FinancialTransfersProject> | undefined): FinancialTransfersProject {
    if (CommonUtils.isValidValue(override)) {
      return new FinancialTransfersProject().clone(override)
    }
    return new FinancialTransfersProject();
  }

  getControlLabels(item: FinancialTransfersProject): { [p: string]: ControlValueLabelLangKey } {
    return  item.getValuesWithLabels();
  }


}
