import { ControlValueLabelLangKey } from '@app/types/types';
import { Component, Input, OnInit } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { AmountOverCountry } from '@app/models/amount-over-country';

@Component({
  selector: 'audit-targeted-countries-distribution',
  templateUrl: './audit-targeted-countries-distribution.component.html',
  styleUrls: ['./audit-targeted-countries-distribution.component.scss']
})
export class AuditTargetedCountriesDistributionComponent extends AuditListGenericComponent<AmountOverCountry> {

  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }

  @Input()
  displayColumns: string[] = ['arName', 'enName', 'amount', 'actions'];
  actions: IMenuItem<AmountOverCountry>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<AmountOverCountry> | undefined): AmountOverCountry {
    if (CommonUtils.isValidValue(override)) {
      return new AmountOverCountry().clone(override)
    }
    return new AmountOverCountry();
  }

  getControlLabels(item: AmountOverCountry): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }


}
