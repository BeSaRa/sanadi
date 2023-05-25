import { Component, Input, OnInit } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { NpoBankAccount } from '@app/models/npo-bank-account';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { ControlValueLabelLangKey } from '@app/types/types';

@Component({
  selector: 'audit-npo-bank-account',
  templateUrl: './audit-npo-bank-account.component.html',
  styleUrls: ['./audit-npo-bank-account.component.scss']
})
export class AuditNpoBankAccountComponent extends AuditListGenericComponent<NpoBankAccount> {

  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }

  displayColumns: string[] = ['bankName', 'accountNumber', 'iban', 'actions'];
  actions: IMenuItem<NpoBankAccount>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<NpoBankAccount> | undefined): NpoBankAccount {
    if (CommonUtils.isValidValue(override)) {
      return new NpoBankAccount().clone(override)
    }
    return new NpoBankAccount();
  }

  getControlLabels(item: NpoBankAccount): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

}
