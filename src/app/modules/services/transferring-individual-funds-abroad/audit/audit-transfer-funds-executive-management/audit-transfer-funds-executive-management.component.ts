import { ControlValueLabelLangKey } from './../../../../../types/types';
import { Component, OnInit } from '@angular/core';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { TransferFundsExecutiveManagement } from '@app/models/transfer-funds-executive-management';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';

@Component({
  selector: 'audit-transfer-funds-executive-management',
  templateUrl: './audit-transfer-funds-executive-management.component.html',
  styleUrls: ['./audit-transfer-funds-executive-management.component.scss']
})
export class AuditTransferFundsExecutiveManagementComponent extends AuditListGenericComponent<TransferFundsExecutiveManagement> {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }

  displayColumns: string[] = ['identificationNumber', 'localName', 'englishName', 'jobTitle', 'nationality', 'actions'];
  actions: IMenuItem<TransferFundsExecutiveManagement>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<TransferFundsExecutiveManagement> | undefined): TransferFundsExecutiveManagement {
    if (CommonUtils.isValidValue(override)) {
      return new TransferFundsExecutiveManagement().clone(override)
    }
    return new TransferFundsExecutiveManagement();
  }

  getControlLabels(item: TransferFundsExecutiveManagement): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }
}
