import {Component} from '@angular/core';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {AuditOperationTypes} from '@app/enums/audit-operation-types';
import {AuditListGenericComponent} from '@app/generics/audit-list-generic-component';
import {CommonUtils} from '@app/helpers/common-utils';
import {IFindInList} from '@app/interfaces/i-find-in-list';
import {GeneralAssociationAgenda} from '@app/models/general-association-meeting-agenda';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {CaseAuditService} from '@app/services/case-audit.service';
import {LangService} from '@app/services/lang.service';
import {ControlValueLabelLangKey} from '@app/types/types';

@Component({
  selector: 'audit-meeting-agenda',
  templateUrl: 'audit-meeting-agenda.component.html',
  styleUrls: ['audit-meeting-agenda.component.scss']
})
export class AuditMeetingAgendaComponent extends AuditListGenericComponent<GeneralAssociationAgenda> {
  constructor(public lang: LangService,
              public caseAuditService: CaseAuditService) {
    super();
  }

  displayColumns: string[] = ['description', 'actions'];
  actions: IMenuItem<GeneralAssociationAgenda>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<GeneralAssociationAgenda> | undefined): GeneralAssociationAgenda {
    if (CommonUtils.isValidValue(override)) {
      return new GeneralAssociationAgenda().clone(override)
    }
    return new GeneralAssociationAgenda();
  }

  getControlLabels(item: GeneralAssociationAgenda): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }
}
