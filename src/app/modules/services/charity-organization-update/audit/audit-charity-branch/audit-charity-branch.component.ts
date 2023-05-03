import { Component } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IFindInList } from '@app/interfaces/i-find-in-list';
import { CharityBranch } from '@app/models/charity-branch';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { ControlValueLabelLangKey } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
    selector: 'audit-charity-branch',
    templateUrl: 'audit-charity-branch.component.html',
    styleUrls: ['audit-charity-branch.component.scss']
})
export class AuditCharityBranchComponent extends AuditListGenericComponent<CharityBranch> {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  displayColumns: string[] = [
    'fullName',
    'address',
    'streetNumber',
    'zoneNumber',
    'buildingNumber',
    'actions'
    ];
  actions: IMenuItem<CharityBranch>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<CharityBranch> | undefined): CharityBranch {
    if (CommonUtils.isValidValue(override)) {
      return new CharityBranch().clone(override)
    }
    return new CharityBranch();
  }

  getControlLabels(item: CharityBranch): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

  existsInList(objComparison: IFindInList<CharityBranch>): CharityBranch | undefined {
    return objComparison.listToCompareWith.find((item) => item.branchId === objComparison.itemToCompare.branchId);
  }
}
