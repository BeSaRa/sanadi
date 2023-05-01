import { Component } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IFindInList } from '@app/interfaces/i-find-in-list';
import { EffectiveCoordinationCapabilities } from '@app/models/effective-coordination-capabilities';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { ControlValueLabelLangKey } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
    selector: 'audit-effective-coordination-capabilities',
    templateUrl: 'audit-effective-coordination-capabilities.component.html',
    styleUrls: ['audit-effective-coordination-capabilities.component.scss']
})
export class AuditEffectiveCoordinationCapabilitiesComponent extends AuditListGenericComponent<EffectiveCoordinationCapabilities> {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  displayColumns: string[] = [
    'eventTopic',
    'motivesAndRationale',
    'eventObjectives',
    'expectedOutcomes',
    'axes',
    'daysNumber',
    'hoursNumber',
    'organizationWay',
    'sponsorsAndOrganizingPartners',
    'financialAllotment',
    'organizationRequiredRole',
    'actions',
    ];
  actions: IMenuItem<EffectiveCoordinationCapabilities>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<EffectiveCoordinationCapabilities> | undefined): EffectiveCoordinationCapabilities {
    if (CommonUtils.isValidValue(override)) {
      return new EffectiveCoordinationCapabilities().clone(override)
    }
    return new EffectiveCoordinationCapabilities();
  }

  getControlLabels(item: EffectiveCoordinationCapabilities): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

  existsInList(objComparison: IFindInList<EffectiveCoordinationCapabilities>): EffectiveCoordinationCapabilities | undefined {
    return objComparison.listToCompareWith.find((item) => item.organizationId === objComparison.itemToCompare.organizationId);
  }
}
