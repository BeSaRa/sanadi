import { Component } from "@angular/core";
import { ActionIconsEnum } from "@app/enums/action-icons-enum";
import { AuditOperationTypes } from "@app/enums/audit-operation-types";
import { AuditListGenericComponent } from "@app/generics/audit-list-generic-component";
import { CommonUtils } from "@app/helpers/common-utils";
import { BankBranch } from "@app/models/bank-branch";
import { IMenuItem } from "@app/modules/context-menu/interfaces/i-menu-item";
import { CaseAuditService } from "@app/services/case-audit.service";
import { LangService } from "@app/services/lang.service";
import { ControlValueLabelLangKey } from "@app/types/types";


@Component({
    selector: 'audit-bank-branch',
    templateUrl: 'audit-bank-branch.component.html',
    styleUrls: ['audit-bank-branch.component.scss']
})
export class AuditBankBranchComponent extends AuditListGenericComponent<BankBranch> {
  constructor(public lang: LangService,
              public caseAuditService: CaseAuditService) {
    super();
  }

  displayColumns: string[] = ['fullName', 'email', 'fax', 'phone', 'recordNo', 'actions'];
  actions: IMenuItem<BankBranch>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<BankBranch> | undefined): BankBranch {
    if (CommonUtils.isValidValue(override)) {
      return new BankBranch().clone(override)
    }
    return new BankBranch();
  }

  getControlLabels(item: BankBranch): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

}
