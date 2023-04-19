import {Component, Input} from '@angular/core';
import {AuditListGenericComponent} from '@app/generics/audit-list-generic-component';
import {ContactOfficer} from '@models/contact-officer';
import {LangService} from '@services/lang.service';
import {CaseAuditService} from '@services/case-audit.service';
import {IMenuItem} from '@modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@enums/action-icons-enum';
import {AuditOperationTypes} from '@enums/audit-operation-types';
import {CommonUtils} from '@helpers/common-utils';
import {ControlValueLabelLangKey} from '@app/types/types';

@Component({
  selector: 'audit-contact-officers',
  templateUrl: './audit-contact-officers.component.html',
  styleUrls: ['./audit-contact-officers.component.scss']
})
export class AuditContactOfficersComponent extends AuditListGenericComponent<ContactOfficer> {
  constructor(public lang: LangService,
              public caseAuditService: CaseAuditService) {
    super();
  }

  @Input()
  displayColumns: string[] = ['arabicName', 'englishName', 'email', 'phone', 'passportNumber', 'actions'];
  actions: IMenuItem<ContactOfficer>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<ContactOfficer> | undefined): ContactOfficer {
    if (CommonUtils.isValidValue(override)) {
      return new ContactOfficer().clone(override)
    }
    return new ContactOfficer();
  }

  getControlLabels(item: ContactOfficer): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }
}
