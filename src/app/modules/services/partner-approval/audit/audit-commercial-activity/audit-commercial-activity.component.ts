import {Component} from '@angular/core';
import {AuditListGenericComponent} from '@app/generics/audit-list-generic-component';
import {LangService} from '@services/lang.service';
import {CaseAuditService} from '@services/case-audit.service';
import {IMenuItem} from '@modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@enums/action-icons-enum';
import {AuditOperationTypes} from '@enums/audit-operation-types';
import {CommonUtils} from '@helpers/common-utils';
import {ControlValueLabelLangKey} from '@app/types/types';
import {CommercialActivity} from '@models/commercial-activity';

@Component({
  selector: 'audit-commercial-activity',
  templateUrl: './audit-commercial-activity.component.html',
  styleUrls: ['./audit-commercial-activity.component.scss']
})
export class AuditCommercialActivityComponent extends AuditListGenericComponent<CommercialActivity> {
  constructor(public lang: LangService,
              public caseAuditService: CaseAuditService) {
    super();
  }

  displayColumns: string[] = ['activityName', 'details', 'actions'];
  actions: IMenuItem<CommercialActivity>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<CommercialActivity> | undefined): CommercialActivity {
    if (CommonUtils.isValidValue(override)) {
      return new CommercialActivity().clone(override)
    }
    return new CommercialActivity();
  }

  getControlLabels(item: CommercialActivity): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }
}
