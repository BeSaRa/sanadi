import { ControlValueLabelLangKey } from '@app/types/types';
import { Component } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { InterventionField } from '@app/models/intervention-field';

@Component({
  selector: 'audit-intervention-field-list',
  templateUrl: './audit-intervention-field-list.component.html',
  styleUrls: ['./audit-intervention-field-list.component.scss']
})
export class AuditInterventionFieldListComponent extends AuditListGenericComponent<InterventionField> {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }

  displayColumns: string[] = ['mainOcha', 'subOcha', 'actions'];
  actions: IMenuItem<InterventionField>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<InterventionField> | undefined): InterventionField {
    if (CommonUtils.isValidValue(override)) {
      return new InterventionField().clone(override)
    }
    return new InterventionField();
  }

  getControlLabels(item: InterventionField): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }
}
