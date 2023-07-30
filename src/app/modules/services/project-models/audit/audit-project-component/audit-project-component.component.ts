import { Component } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IFindInList } from '@app/interfaces/i-find-in-list';
import { ProjectComponent } from '@app/models/project-component';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { ControlValueLabelLangKey } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
    selector: 'audit-project-component',
    templateUrl: 'audit-project-component.component.html',
    styleUrls: ['audit-project-component.component.scss']
})
export class AuditProjectComponentComponent extends AuditListGenericComponent<ProjectComponent> {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  displayColumns: string[] = ['componentName', 'details', 'expensesType', 'totalCost', 'actions'];
  actions: IMenuItem<ProjectComponent>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<ProjectComponent> | undefined): ProjectComponent {
    if (CommonUtils.isValidValue(override)) {
      return new ProjectComponent().clone(override)
    }
    return new ProjectComponent();
  }

  getControlLabels(item: ProjectComponent): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

}
