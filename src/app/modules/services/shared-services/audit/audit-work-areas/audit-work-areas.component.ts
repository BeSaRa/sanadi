import {Component} from '@angular/core';
import {LangService} from '@services/lang.service';
import {CaseAuditService} from '@services/case-audit.service';
import {AuditOperationTypes} from '@enums/audit-operation-types';
import {IMenuItem} from '@modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@enums/action-icons-enum';
import {WorkArea} from '@models/work-area';
import {AuditListGenericComponent} from '@app/generics/audit-list-generic-component';
import {CommonUtils} from '@helpers/common-utils';
import {ControlValueLabelLangKey} from '@app/types/types';

@Component({
  selector: 'audit-work-areas',
  templateUrl: './audit-work-areas.component.html',
  styleUrls: ['./audit-work-areas.component.scss']
})
export class AuditWorkAreasComponent extends AuditListGenericComponent<WorkArea> {
  constructor(public lang: LangService,
              public caseAuditService: CaseAuditService) {
    super();
  }

  displayColumns: string[] = ['country', 'region', 'actions'];
  actions: IMenuItem<WorkArea>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<WorkArea> | undefined): WorkArea {
    if (CommonUtils.isValidValue(override)) {
      return new WorkArea().clone(override)
    }
    return new WorkArea();
  }

  getControlLabels(item: WorkArea): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

}
