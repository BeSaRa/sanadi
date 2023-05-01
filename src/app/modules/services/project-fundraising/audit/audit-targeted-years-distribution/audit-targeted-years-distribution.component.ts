import { Component, Input, OnInit } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { AmountOverYear } from '@app/models/amount-over-year';
import { CustomValidators } from '@app/validators/custom-validators';
import { ControlValueLabelLangKey } from '@app/types/types';

@Component({
  selector: 'audit-targeted-years-distribution',
  templateUrl: './audit-targeted-years-distribution.component.html',
  styleUrls: ['./audit-targeted-years-distribution.component.scss']
})
export class AuditTargetedYearsDistributionComponent extends AuditListGenericComponent<AmountOverYear> {

  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }

  maskPattern = CustomValidators.inputMaskPatterns;
  @Input()
  displayColumns: string[] = ['year', 'amount', 'actions'];
  actions: IMenuItem<AmountOverYear>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<AmountOverYear> | undefined): AmountOverYear {
    if (CommonUtils.isValidValue(override)) {
      return new AmountOverYear().clone(override)
    }
    return new AmountOverYear();
  }

  getControlLabels(item: AmountOverYear): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

}
