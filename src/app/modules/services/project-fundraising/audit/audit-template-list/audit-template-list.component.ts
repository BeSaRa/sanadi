import { Component, Input, OnInit } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { ProjectTemplate } from '@app/models/projectTemplate';
import { CustomValidators } from '@app/validators/custom-validators';
import { ControlValueLabelLangKey } from '@app/types/types';

@Component({
  selector: 'audit-template-list',
  templateUrl: './audit-template-list.component.html',
  styleUrls: ['./audit-template-list.component.scss']
})
export class AuditTemplateListComponent extends AuditListGenericComponent<ProjectTemplate> {

  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  @Input()
  displayColumns: string[] = ['public_status', 'review_status', 'name', 'serial', 'totalCost', 'actions'];
  actions: IMenuItem<ProjectTemplate>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<ProjectTemplate> | undefined): ProjectTemplate {
    if (CommonUtils.isValidValue(override)) {
      return new ProjectTemplate().clone(override)
    }
    return new ProjectTemplate();
  }

  getControlLabels(item: ProjectTemplate): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

}
