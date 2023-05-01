import { Component } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IFindInList } from '@app/interfaces/i-find-in-list';
import { ParticipantOrg } from '@app/models/participant-org';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { ControlValueLabelLangKey } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
    selector: 'audit-participant-organization',
    templateUrl: 'audit-participant-organization.component.html',
    styleUrls: ['audit-participant-organization.component.scss']
})
export class AuditParticipantOrganizationComponent extends AuditListGenericComponent<ParticipantOrg> {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  displayColumns: string[] = ['arName', 'enName', 'managerDecisionInfo','value', 'notes' ,'actions'];
  actions: IMenuItem<ParticipantOrg>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<ParticipantOrg> | undefined): ParticipantOrg {
    if (CommonUtils.isValidValue(override)) {
      return new ParticipantOrg().clone(override)
    }
    return new ParticipantOrg();
  }

  getControlLabels(item: ParticipantOrg): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

  existsInList(objComparison: IFindInList<ParticipantOrg>): ParticipantOrg | undefined {
    return objComparison.listToCompareWith.find((item) => item.organizationId === objComparison.itemToCompare.organizationId);
  }

}
