import {Component} from '@angular/core';
import {AuditListGenericComponent} from '@app/generics/audit-list-generic-component';
import {ManagementCouncil} from '@models/management-council';
import {LangService} from '@services/lang.service';
import {CaseAuditService} from '@services/case-audit.service';
import {IMenuItem} from '@modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@enums/action-icons-enum';
import {AuditOperationTypes} from '@enums/audit-operation-types';
import {CommonUtils} from '@helpers/common-utils';
import {ControlValueLabelLangKey} from '@app/types/types';

@Component({
  selector: 'audit-management-council',
  templateUrl: './audit-management-council.component.html',
  styleUrls: ['./audit-management-council.component.scss']
})
export class AuditManagementCouncilComponent extends AuditListGenericComponent<ManagementCouncil> {
  constructor(public lang: LangService,
              public caseAuditService: CaseAuditService) {
    super();
  }

  displayColumns: string[] = ['arabicName', 'englishName', 'email', 'nationality', 'passportNumber', 'actions'];
  actions: IMenuItem<ManagementCouncil>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<ManagementCouncil> | undefined): ManagementCouncil {
    if (CommonUtils.isValidValue(override)) {
      return new ManagementCouncil().clone(override)
    }
    return new ManagementCouncil();
  }

  getControlLabels(item: ManagementCouncil): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }
}
