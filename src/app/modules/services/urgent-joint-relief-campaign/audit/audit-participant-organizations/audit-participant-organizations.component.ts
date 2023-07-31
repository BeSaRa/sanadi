import { ControlValueLabelLangKey } from './../../../../../types/types';
import { Component, OnInit } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { ParticipantOrganization } from '@app/models/participant-organization';

@Component({
  selector: 'audit-participant-organizations',
  templateUrl: './audit-participant-organizations.component.html',
  styleUrls: ['./audit-participant-organizations.component.scss']
})
export class AuditParticipantOrganizationsComponent extends AuditListGenericComponent<ParticipantOrganization> {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }

  displayColumns: string[] = ['arName', 'enName', 'managerDecisionInfo','value', 'notes' ,'actions'];
  actions: IMenuItem<ParticipantOrganization>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<ParticipantOrganization> | undefined): ParticipantOrganization {
    if (CommonUtils.isValidValue(override)) {
      return new ParticipantOrganization().clone(override)
    }
    return new ParticipantOrganization();
  }

  getControlLabels(item: ParticipantOrganization): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }
}
