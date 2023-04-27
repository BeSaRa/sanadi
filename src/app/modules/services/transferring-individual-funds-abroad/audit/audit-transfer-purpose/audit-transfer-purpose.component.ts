import { ControlValueLabelLangKey } from './../../../../../types/types';
import { Component, OnInit } from '@angular/core';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { TransferFundsCharityPurpose } from '@app/models/transfer-funds-charity-purpose';

@Component({
  selector: 'audit-transfer-purpose',
  templateUrl: './audit-transfer-purpose.component.html',
  styleUrls: ['./audit-transfer-purpose.component.scss']
})
export class AuditTransferPurposeComponent extends AuditListGenericComponent<TransferFundsCharityPurpose> {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }

  displayColumns: string[] = ['projectName', 'projectType', 'domain', 'totalCost', 'beneficiaryCountry', 'executionCountry', 'actions'];
  actions: IMenuItem<TransferFundsCharityPurpose>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<TransferFundsCharityPurpose> | undefined): TransferFundsCharityPurpose {
    if (CommonUtils.isValidValue(override)) {
      return new TransferFundsCharityPurpose().clone(override)
    }
    return new TransferFundsCharityPurpose();
  }

  getControlLabels(item: TransferFundsCharityPurpose): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }
}
