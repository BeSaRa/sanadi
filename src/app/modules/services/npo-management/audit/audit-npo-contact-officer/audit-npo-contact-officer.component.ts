import { Component, Input, OnInit } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { NpoContactOfficer } from '@app/models/npo-contact-officer';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { ControlValueLabelLangKey } from '@app/types/types';

@Component({
  selector: 'audit-npo-contact-officer',
  templateUrl: './audit-npo-contact-officer.component.html',
  styleUrls: ['./audit-npo-contact-officer.component.scss']
})
export class AuditNpoContactOfficerComponent extends AuditListGenericComponent<NpoContactOfficer> {

  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }

  @Input()
  displayColumns: string[] = ['idNumber', 'fullName', 'email', 'phone', 'extraPhone', 'actions'];
  actions: IMenuItem<NpoContactOfficer>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<NpoContactOfficer> | undefined): NpoContactOfficer {
    if (CommonUtils.isValidValue(override)) {
      return new NpoContactOfficer().clone(override)
    }
    return new NpoContactOfficer();
  }

  getControlLabels(item: NpoContactOfficer): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

}
