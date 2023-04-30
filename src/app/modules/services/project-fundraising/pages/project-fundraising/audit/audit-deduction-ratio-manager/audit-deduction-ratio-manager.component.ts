import { ControlValueLabelLangKey } from './../../../../../../../types/types';
import { Component, Input, OnInit } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { DeductedPercentage } from '@app/models/deducted-percentage';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';

@Component({
  selector: 'audit-deduction-ratio-manager',
  templateUrl: './audit-deduction-ratio-manager.component.html',
  styleUrls: ['./audit-deduction-ratio-manager.component.scss']
})
export class AuditDeductionRatioManagerComponent extends AuditListGenericComponent<DeductedPercentage> {

  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }

  @Input()
  displayColumns: string[] = ['arabic_name', 'english_name', 'percentage', 'actions'];
  actions: IMenuItem<DeductedPercentage>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<DeductedPercentage> | undefined): DeductedPercentage {
    if (CommonUtils.isValidValue(override)) {
      return new DeductedPercentage().clone(override)
    }
    return new DeductedPercentage();
  }

  getControlLabels(item: DeductedPercentage): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

}
