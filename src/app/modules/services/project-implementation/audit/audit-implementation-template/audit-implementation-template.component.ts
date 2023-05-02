import { Component, Input, OnInit } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { ImplementationTemplate } from '@app/models/implementation-template';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { ControlValueLabelLangKey } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
  selector: 'audit-implementation-template',
  templateUrl: './audit-implementation-template.component.html',
  styleUrls: ['./audit-implementation-template.component.scss']
})
export class AuditImplementationTemplateComponent extends AuditListGenericComponent<ImplementationTemplate> implements OnInit {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }
  @Input() isGrant: boolean = false;
  inputMaskPatterns = CustomValidators.inputMaskPatterns
  displayColumns: string[] = ['templateName', 'templateCost', 'executionRegion', 'arabicName', 'englishName', 'region', 'beneficiaryRegion', 'location', 'projectCost', 'actions']
  actions: IMenuItem<ImplementationTemplate>[] = [
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
  _getNewInstance(override: Partial<ImplementationTemplate> | undefined): ImplementationTemplate {
    if (CommonUtils.isValidValue(override)) {
      return new ImplementationTemplate().clone(override)
    }
    return new ImplementationTemplate();
  }

  getControlLabels(item: ImplementationTemplate): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }
}
