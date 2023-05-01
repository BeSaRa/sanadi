import { Component } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IFindInList } from '@app/interfaces/i-find-in-list';
import { ProjectAddress } from '@app/models/project-address';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { ControlValueLabelLangKey } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
    selector: 'audit-project-address',
    templateUrl: 'audit-project-address.component.html',
    styleUrls: ['audit-project-address.component.scss']
})
export class AuditProjectAddressComponent extends AuditListGenericComponent<ProjectAddress> {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  displayColumns: string[] = ['beneficiaryRegion', 'address', 'location', 'actions'];
  actions: IMenuItem<ProjectAddress>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<ProjectAddress> | undefined): ProjectAddress {
    if (CommonUtils.isValidValue(override)) {
      return new ProjectAddress().clone(override)
    }
    return new ProjectAddress();
  }
  openLocationMap(item: ProjectAddress) {
    item.openMap(true);
  }
  getControlLabels(item: ProjectAddress): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

  existsInList(objComparison: IFindInList<ProjectAddress>): ProjectAddress | undefined {
    return objComparison.listToCompareWith.find((item) => item.beneficiaryRegion === objComparison.itemToCompare.beneficiaryRegion);
  }

}
