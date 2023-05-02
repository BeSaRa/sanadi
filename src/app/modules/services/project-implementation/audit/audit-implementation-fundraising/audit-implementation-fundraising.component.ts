import { Component, Input, OnInit } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { ImplementationFundraising } from '@app/models/implementation-fundraising';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { ControlValueLabelLangKey } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
  selector: 'audit-implementation-fundraising',
  templateUrl: './audit-implementation-fundraising.component.html',
  styleUrls: ['./audit-implementation-fundraising.component.scss']
})
export class AuditImplementationFundraisingComponent extends AuditListGenericComponent<ImplementationFundraising> implements OnInit {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }
  @Input() isGrant: boolean = false;
  inputMaskPatterns = CustomValidators.inputMaskPatterns
  displayColumns: string[] = [
    'projectLicenseFullSerial',
    'permitType',
    'arName',
    'enName',
    'projectTotalCost',
    'consumedAmount',
    'remainingAmount',
    'totalCost',
    'actions'
  ];
  actions: IMenuItem<ImplementationFundraising>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  ngOnInit(): void {
    this.isGrant && this.displayColumns.unshift('fullName')
  }
  _getNewInstance(override: Partial<ImplementationFundraising> | undefined): ImplementationFundraising {
    if (CommonUtils.isValidValue(override)) {
      return new ImplementationFundraising().clone(override)
    }
    return new ImplementationFundraising();
  }

  getControlLabels(item: ImplementationFundraising): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

}
