import {ControlValueLabelLangKey} from '@app/types/types';
import {Component} from '@angular/core';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {AuditOperationTypes} from '@app/enums/audit-operation-types';
import {AuditListGenericComponent} from '@app/generics/audit-list-generic-component';
import {CommonUtils} from '@app/helpers/common-utils';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {CaseAuditService} from '@app/services/case-audit.service';
import {LangService} from '@app/services/lang.service';
import {InterventionRegion} from '@app/models/intervention-region';
import {IFindInList} from "@contracts/i-find-in-list";

@Component({
  selector: 'audit-intervention-region-list',
  templateUrl: './audit-intervention-region-list.component.html',
  styleUrls: ['./audit-intervention-region-list.component.scss']
})
export class AuditInterventionRegionListComponent extends AuditListGenericComponent<InterventionRegion> {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }

  displayColumns: string[] = ['region', 'description', 'actions'];
  actions: IMenuItem<InterventionRegion>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<InterventionRegion> | undefined): InterventionRegion {
    if (CommonUtils.isValidValue(override)) {
      return new InterventionRegion().clone(override)
    }
    return new InterventionRegion();
  }

  getControlLabels(item: InterventionRegion): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

  existsInList(objComparison: IFindInList<InterventionRegion>): InterventionRegion | undefined {
    return objComparison.listToCompareWith.find((item) => (
      item.region === objComparison.itemToCompare.region
      && item.description === objComparison.itemToCompare.description)
    );
  }
}
