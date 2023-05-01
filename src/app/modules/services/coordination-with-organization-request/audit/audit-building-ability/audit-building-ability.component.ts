import { Component } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IFindInList } from '@app/interfaces/i-find-in-list';
import { BuildingAbility } from '@app/models/building-ability';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { ControlValueLabelLangKey } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
    selector: 'audit-building-ability',
    templateUrl: 'audit-building-ability.component.html',
    styleUrls: ['audit-building-ability.component.scss']
})
export class AuditBuildingAbilityComponent extends AuditListGenericComponent<BuildingAbility> {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  displayColumns: string[] = [
    'activityName',
      'trainingActivityType',
      'activityGoal',
      'trainingActivityMainAxes',
      'trainingLanguage',
      'targetGroupNature',
      'participantsMaximumNumber',
      'trainingWay',
      'actions',
    ];
  actions: IMenuItem<BuildingAbility>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<BuildingAbility> | undefined): BuildingAbility {
    if (CommonUtils.isValidValue(override)) {
      return new BuildingAbility().clone(override)
    }
    return new BuildingAbility();
  }

  getControlLabels(item: BuildingAbility): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

  existsInList(objComparison: IFindInList<BuildingAbility>): BuildingAbility | undefined {
    return objComparison.listToCompareWith.find((item) => item.organizationId === objComparison.itemToCompare.organizationId);
  }
}
