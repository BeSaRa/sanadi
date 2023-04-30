import { Component } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IFindInList } from '@app/interfaces/i-find-in-list';
import { FormalyTemplate } from '@app/models/formaly-template';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { ControlValueLabelLangKey } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
    selector: 'audit-sample-data',
    templateUrl: 'audit-sample-data.component.html',
    styleUrls: ['audit-sample-data.component.scss']
})
export class AuditSampleDataComponent extends AuditListGenericComponent<FormalyTemplate> {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  displayColumns: string[] = [
    'value',
    'actions'];
  actions: IMenuItem<FormalyTemplate>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<FormalyTemplate> | undefined): FormalyTemplate {
    if (CommonUtils.isValidValue(override)) {
      return new FormalyTemplate().clone(override)
    }
    return new FormalyTemplate();
  }

  getControlLabels(item: FormalyTemplate): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

  existsInList(objComparison: IFindInList<FormalyTemplate>): FormalyTemplate | undefined {
    return objComparison.listToCompareWith.find((item) => item.id === objComparison.itemToCompare.id);
  }

}
