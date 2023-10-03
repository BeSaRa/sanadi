import { Component } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IFindInList } from '@app/interfaces/i-find-in-list';
import { RealBeneficiary } from '@app/models/real-beneficiary';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { ControlValueLabelLangKey } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
    selector: 'audit-real-beneficiary',
    templateUrl: 'audit-real-beneficiary.component.html',
    styleUrls: ['audit-real-beneficiary.component.scss']
})
export class AuditRealBeneficiaryComponent extends AuditListGenericComponent<RealBeneficiary> {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  displayColumns: string[] =[
    'arabicName',
    'englishName',
    'birthDate',
    'birthLocation',
    'actions',
  ];
  actions: IMenuItem<RealBeneficiary>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<RealBeneficiary> | undefined): RealBeneficiary {
    if (CommonUtils.isValidValue(override)) {
      return new RealBeneficiary().clone(override)
    }
    return new RealBeneficiary();
  }

  getControlLabels(item: RealBeneficiary): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

  existsInList(objComparison: IFindInList<RealBeneficiary>): RealBeneficiary | undefined {
    return objComparison.listToCompareWith.find((item) => item.identificationNumber === objComparison.itemToCompare.identificationNumber && item.itemId === objComparison.itemToCompare.itemId);
  }
}
