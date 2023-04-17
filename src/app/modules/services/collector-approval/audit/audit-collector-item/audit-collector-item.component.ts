import { Component, OnInit } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IFindInList } from '@app/interfaces/i-find-in-list';
import { CollectorItem } from '@app/models/collector-item';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { ControlValueLabelLangKey } from '@app/types/types';

@Component({
  selector: 'audit-collector-item',
  templateUrl: './audit-collector-item.component.html',
  styleUrls: ['./audit-collector-item.component.scss']
})
export class AuditCollectorItemComponent extends AuditListGenericComponent<CollectorItem> {
  constructor(public lang: LangService,
              public caseAuditService: CaseAuditService) {
    super();
  }

  displayColumns: string[] = ['identificationNumber', 'arabicName', 'collectorType', 'jobTitle',  'exportedLicenseFullSerial','actions'];
  actions: IMenuItem<CollectorItem>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<CollectorItem> | undefined): CollectorItem {
    if (CommonUtils.isValidValue(override)) {
      return new CollectorItem().clone(override)
    }
    return new CollectorItem();
  }

  getControlLabels(item: CollectorItem): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }



}
