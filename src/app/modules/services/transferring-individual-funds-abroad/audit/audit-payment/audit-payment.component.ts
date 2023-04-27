import { ControlValueLabelLangKey } from './../../../../../types/types';
import { Component, OnInit } from '@angular/core';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { Payment } from '@app/models/payment';

@Component({
  selector: 'audit-payment',
  templateUrl: './audit-payment.component.html',
  styleUrls: ['./audit-payment.component.scss']
})
export class AuditPaymentComponent extends AuditListGenericComponent<Payment> {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }

  displayColumns: string[] = ['paymentNo', 'totalCost', 'dueDate', 'actions'];
  actions: IMenuItem<Payment>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<Payment> | undefined): Payment {
    if (CommonUtils.isValidValue(override)) {
      return new Payment().clone(override)
    }
    return new Payment();
  }

  getControlLabels(item: Payment): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }
}
