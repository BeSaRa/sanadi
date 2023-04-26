import { Component } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IFindInList } from '@app/interfaces/i-find-in-list';
import { ProjectNeed, ProjectNeeds } from '@app/models/project-needs';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { ControlValueLabelLangKey } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
  selector: 'audit-project-need',
  templateUrl: 'audit-project-need.component.html',
  styleUrls: ['audit-project-need.component.scss']
})
export class AuditProjectNeedComponent extends AuditListGenericComponent<ProjectNeed> {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  displayColumns: string[] = [
    'projectName',
    'projectDescription',
    'beneficiaries',
    'goals',
    'totalCost',
    'actions'];
  actions: IMenuItem<ProjectNeed>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<ProjectNeed> | undefined): ProjectNeed {
    if (CommonUtils.isValidValue(override)) {
      return new ProjectNeed().clone(override)
    }
    return new ProjectNeed();
  }

  getControlLabels(item: ProjectNeed): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

  existsInList(objComparison: IFindInList<ProjectNeed>): ProjectNeed | undefined {
    return objComparison.listToCompareWith.find((item) => item.projectName === objComparison.itemToCompare.projectName);
  }
}
