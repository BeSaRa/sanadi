import { Component } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IFindInList } from '@app/interfaces/i-find-in-list';
import { CharityDecision } from '@app/models/charity-decision';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { ControlValueLabelLangKey } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
    selector: 'audit-charity-decisions',
    templateUrl: 'audit-charity-decisions.component.html',
    styleUrls: ['audit-charity-decisions.component.scss']
})
export class AuditCharityDecisionsComponent extends AuditListGenericComponent<CharityDecision> {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  displayColumns: string[] = [    'referenceNumber', 'generalDate', 'subject',    'actions'    ];
  actions: IMenuItem<CharityDecision>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<CharityDecision> | undefined): CharityDecision {
    if (CommonUtils.isValidValue(override)) {
      return new CharityDecision().clone(override)
    }
    return new CharityDecision();
  }

  getControlLabels(item: CharityDecision): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

}
