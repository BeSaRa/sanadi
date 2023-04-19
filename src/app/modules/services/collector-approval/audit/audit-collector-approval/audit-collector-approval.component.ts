import { Component, OnInit } from '@angular/core';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditCaseProperties } from '@app/interfaces/i-audit-case-properties';
import { IValueDifference } from '@app/interfaces/i-value-difference';
import { CollectorApproval } from '@app/models/collector-approval';
import { LangService } from '@app/services/lang.service';

@Component({
  selector: 'audit-collector-approval',
  templateUrl: './audit-collector-approval.component.html',
  styleUrls: ['./audit-collector-approval.component.scss']
})
export class AuditCollectorApprovalComponent implements IAuditCaseProperties<CollectorApproval>, OnInit {
  newVersion!: CollectorApproval; // don't delete or rename the property
  oldVersion!: CollectorApproval; // don't delete or rename the property

  basicInfoDifferences: IValueDifference[] = [];
  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this._getBasicInfoDifferences();
  }

  private _getBasicInfoDifferences(): void {
    const newVersionDataModel: Partial<CollectorApproval> = ObjectUtils.getControlComparisonValues<CollectorApproval>(this.newVersion.getBasicInfoValuesWithLabels());
    const oldVersionDataModel: Partial<CollectorApproval> = ObjectUtils.getControlComparisonValues<CollectorApproval>(this.oldVersion.getBasicInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getBasicInfoValuesWithLabels());
    this.basicInfoDifferences = ObjectUtils.getValueDifferencesList<CollectorApproval, CollectorApproval>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }

}
