import { ControlValueLabelLangKey } from '@app/types/types';
import { Component } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { ImplementingAgency } from '@app/models/implementing-agency';
import {IFindInList} from "@contracts/i-find-in-list";

@Component({
  selector: 'audit-intervention-implementing-agency-list',
  templateUrl: './audit-intervention-implementing-agency-list.component.html',
  styleUrls: ['./audit-intervention-implementing-agency-list.component.scss']
})
export class AuditInterventionImplementingAgencyListComponent extends AuditListGenericComponent<ImplementingAgency> {
  constructor(public lang: LangService,
              public caseAuditService: CaseAuditService) {
    super();
  }

  displayColumns: string[] = ['implementingAgencyType', 'implementingAgency', 'actions'];
  actions: IMenuItem<ImplementingAgency>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<ImplementingAgency> | undefined): ImplementingAgency {
    if (CommonUtils.isValidValue(override)) {
      return new ImplementingAgency().clone(override)
    }
    return new ImplementingAgency();
  }

  getControlLabels(item: ImplementingAgency): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

  existsInList(objComparison: IFindInList<ImplementingAgency>): ImplementingAgency | undefined {
    return objComparison.listToCompareWith.find((item) => (
      item.implementingAgencyType === objComparison.itemToCompare.implementingAgencyType
      && item.implementingAgency === objComparison.itemToCompare.implementingAgency)
    );
  }
}
