import { Component, OnInit } from '@angular/core';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditCaseProperties } from '@app/interfaces/i-audit-case-properties';
import { IValueDifference } from '@app/interfaces/i-value-difference';
import { FinalExternalOfficeApproval } from '@app/models/final-external-office-approval';
import { LangService } from '@app/services/lang.service';

@Component({
    selector: 'audit-final-external-office-approval',
    templateUrl: 'audit-final-external-office-approval.component.html',
    styleUrls: ['audit-final-external-office-approval.component.scss']
})
export class AuditFinalExternalOfficeApprovalComponent  implements IAuditCaseProperties<FinalExternalOfficeApproval>, OnInit {
  newVersion!: FinalExternalOfficeApproval; // don't delete or rename the property
  oldVersion!: FinalExternalOfficeApproval; // don't delete or rename the property

  basicInfoDifferences: IValueDifference[] = [];
  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this._getBasicInfoDifferences();
  }

  private _getBasicInfoDifferences(): void {
    const newVersionDataModel: Partial<FinalExternalOfficeApproval> = ObjectUtils.getControlComparisonValues<FinalExternalOfficeApproval>(this.newVersion.getBasicInfoValuesWithLabels());
    const oldVersionDataModel: Partial<FinalExternalOfficeApproval> = ObjectUtils.getControlComparisonValues<FinalExternalOfficeApproval>(this.oldVersion.getBasicInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getBasicInfoValuesWithLabels());
    this.basicInfoDifferences = ObjectUtils.getValueDifferencesList<FinalExternalOfficeApproval, FinalExternalOfficeApproval>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }

}
