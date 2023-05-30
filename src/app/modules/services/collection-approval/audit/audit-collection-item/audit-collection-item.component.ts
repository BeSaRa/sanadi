import { Component, Input } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CollectionRequestType } from '@app/enums/service-request-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IFindInList } from '@app/interfaces/i-find-in-list';
import { AdminResult } from '@app/models/admin-result';
import { CollectionItem } from '@app/models/collection-item';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { ControlValueLabelLangKey } from '@app/types/types';

@Component({
  selector: 'audit-collection-item',
  templateUrl: './audit-collection-item.component.html',
  styleUrls: ['./audit-collection-item.component.scss']
})
export class AuditCollectionItemComponent extends AuditListGenericComponent<CollectionItem> {
  @Input() requestType!: CollectionRequestType;
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }

  displayColumns: string[] = ['identificationNumber', 'zoneNumber', 'streetNumber', 'buildingNumber', 'unitNumber', 'licenseEndDate', 'oldLicenseFullSerial', 'actions'];
  actions: IMenuItem<CollectionItem>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];
  isNewRequestType(): boolean {
    return this.requestType === CollectionRequestType.NEW;
  }
  _getNewInstance(override: Partial<CollectionItem> | undefined): CollectionItem {
    if (CommonUtils.isValidValue(override)) {
      return new CollectionItem().clone(override)
    }
    return new CollectionItem();
  }

  getControlLabels(item: CollectionItem): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

  existsInList(objComparison: IFindInList<CollectionItem>): CollectionItem | undefined {
    return objComparison.listToCompareWith.find((item) => item.identificationNumber === objComparison.itemToCompare.identificationNumber);
  }
  openLocationMap(item: CollectionItem) {
    item.openMap(true);
  }
  getDifferencesPopupTitle(item: CollectionItem): AdminResult | undefined {
    return AdminResult.createInstance({
      arName: item.identificationNumber,
      enName: item.identificationNumber
    })
  }
}
