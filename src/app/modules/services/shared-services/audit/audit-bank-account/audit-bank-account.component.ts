import {Component} from '@angular/core';
import {BankAccount} from '@models/bank-account';
import {CaseTypes} from '@enums/case-types.enum';
import {AuditOperationTypes} from '@enums/audit-operation-types';
import {LangService} from '@services/lang.service';
import {IMenuItem} from '@modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@enums/action-icons-enum';
import {AdminResult} from '@models/admin-result';
import {CaseAuditService} from '@services/case-audit.service';
import {AuditListGenericComponent} from '@app/generics/audit-list-generic-component';
import {CommonUtils} from '@helpers/common-utils';
import {ControlValueLabelLangKey} from '@app/types/types';

@Component({
  selector: 'audit-bank-account',
  templateUrl: './audit-bank-account.component.html',
  styleUrls: ['./audit-bank-account.component.scss']
})
export class AuditBankAccountComponent extends AuditListGenericComponent<BankAccount> {
  constructor(public lang: LangService,
              public caseAuditService: CaseAuditService) {
    super();
  }

  displayColumns: string[] = ['bankName', 'accountNumber', 'iBan', 'country', 'actions'];
  actions: IMenuItem<BankAccount>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<BankAccount> | undefined): BankAccount {
    if (CommonUtils.isValidValue(override)) {
      return new BankAccount().clone(override)
    }
    return new BankAccount();
  }

  getControlLabels(item: BankAccount): { [key: string]: ControlValueLabelLangKey } {
    return item.getBankAccountValuesWithLabels(CaseTypes.PARTNER_APPROVAL);
  }
}
