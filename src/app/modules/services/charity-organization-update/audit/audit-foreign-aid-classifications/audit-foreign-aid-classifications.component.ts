import { Component } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IFindInList } from '@app/interfaces/i-find-in-list';
import { ForeignAidClassification } from '@app/models/foreign-aid-classification';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { ControlValueLabelLangKey } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
    selector: 'audit-foreign-aid-classifications',
    templateUrl: 'audit-foreign-aid-classifications.component.html',
    styleUrls: ['audit-foreign-aid-classifications.component.scss']
})
export class AuditForeignAidClassificationsComponent extends AuditListGenericComponent<ForeignAidClassification> {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  displayColumns: string[] =['aidClassification', 'domain', 'mainUNOCHACategory', 'subUNOCHACategory', 'mainDACCategory', 'subDACCategory', 'actions']
  actions: IMenuItem<ForeignAidClassification>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<ForeignAidClassification> | undefined): ForeignAidClassification {
    if (CommonUtils.isValidValue(override)) {
      return new ForeignAidClassification().clone(override)
    }
    return new ForeignAidClassification();
  }

  getControlLabels(item: ForeignAidClassification): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

  existsInList(objComparison: IFindInList<ForeignAidClassification>): ForeignAidClassification | undefined {
    return objComparison.listToCompareWith.find((item) => item.id === objComparison.itemToCompare.id);
  }
}
