import { Component } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IFindInList } from '@app/interfaces/i-find-in-list';
import { ResearchAndStudies } from '@app/models/research-and-studies';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { ControlValueLabelLangKey } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
    selector: 'audit-research-and-studies',
    templateUrl: 'audit-research-and-studies.component.html',
    styleUrls: ['audit-research-and-studies.component.scss']
})
export class AuditResearchAndStudiesComponent extends AuditListGenericComponent<ResearchAndStudies> {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  displayColumns: string[] = [
    'researchTopic',
    'researchAndStudyObjectives',
    'expectedResearchResults',
    'generalLandmarks',
    'requiredRole',
    'financialCost',
    'actions',
    ];
  actions: IMenuItem<ResearchAndStudies>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<ResearchAndStudies> | undefined): ResearchAndStudies {
    if (CommonUtils.isValidValue(override)) {
      return new ResearchAndStudies().clone(override)
    }
    return new ResearchAndStudies();
  }

  getControlLabels(item: ResearchAndStudies): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

  existsInList(objComparison: IFindInList<ResearchAndStudies>): ResearchAndStudies | undefined {
    return objComparison.listToCompareWith.find((item) => item.organizationId === objComparison.itemToCompare.organizationId);
  }

}
