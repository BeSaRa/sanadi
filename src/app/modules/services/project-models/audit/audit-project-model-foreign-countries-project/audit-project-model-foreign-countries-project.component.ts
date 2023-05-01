import { Component } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IFindInList } from '@app/interfaces/i-find-in-list';
import { ProjectModelForeignCountriesProject } from '@app/models/project-model-foreign-countries-project';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { ControlValueLabelLangKey } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
    selector: 'audit-project-model-foreign-countries-project',
    templateUrl: 'audit-project-model-foreign-countries-project.component.html',
    styleUrls: ['audit-project-model-foreign-countries-project.component.scss']
})
export class AuditProjectModelForeignCountriesProjectComponent extends AuditListGenericComponent<ProjectModelForeignCountriesProject> {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  displayColumns: string[] = ['projectName', 'notes', 'actions'];
  actions: IMenuItem<ProjectModelForeignCountriesProject>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<ProjectModelForeignCountriesProject> | undefined): ProjectModelForeignCountriesProject {
    if (CommonUtils.isValidValue(override)) {
      return new ProjectModelForeignCountriesProject().clone(override)
    }
    return new ProjectModelForeignCountriesProject();
  }

  getControlLabels(item: ProjectModelForeignCountriesProject): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

  existsInList(objComparison: IFindInList<ProjectModelForeignCountriesProject>): ProjectModelForeignCountriesProject | undefined {
    return objComparison.listToCompareWith.find((item) => item.objectDBId === objComparison.itemToCompare.objectDBId);
  }

}
