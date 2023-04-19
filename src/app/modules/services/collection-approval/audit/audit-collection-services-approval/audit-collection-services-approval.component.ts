import { Component, OnInit } from '@angular/core';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditCaseProperties } from '@app/interfaces/i-audit-case-properties';
import { IValueDifference } from '@app/interfaces/i-value-difference';
import { CollectionApproval } from '@app/models/collection-approval';
import { LangService } from '@app/services/lang.service';

@Component({
  selector: 'audit-collection-services-approval',
  templateUrl: './audit-collection-services-approval.component.html',
  styleUrls: ['./audit-collection-services-approval.component.scss']
})
export class AuditCollectionServicesApprovalComponent implements IAuditCaseProperties<CollectionApproval>, OnInit {
  newVersion!: CollectionApproval; // don't delete or rename the property
  oldVersion!: CollectionApproval; // don't delete or rename the property

  basicInfoDifferences: IValueDifference[] = [];
  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this._getBasicInfoDifferences();
  }

  private _getBasicInfoDifferences(): void {
    const newVersionDataModel: Partial<CollectionApproval> = ObjectUtils.getControlComparisonValues<CollectionApproval>(this.newVersion.getBasicInfoValuesWithLabels());
    const oldVersionDataModel: Partial<CollectionApproval> = ObjectUtils.getControlComparisonValues<CollectionApproval>(this.oldVersion.getBasicInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getBasicInfoValuesWithLabels());
    this.basicInfoDifferences = ObjectUtils.getValueDifferencesList<CollectionApproval, CollectionApproval>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }


}
