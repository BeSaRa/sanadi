import { Component, OnInit } from '@angular/core';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditCaseProperties } from '@app/interfaces/i-audit-case-properties';
import { IValueDifference } from '@app/interfaces/i-value-difference';
import { NpoManagement } from '@app/models/npo-management';
import { LangService } from '@app/services/lang.service';

@Component({
  selector: 'audit-npo-management',
  templateUrl: './audit-npo-management.component.html',
  styleUrls: ['./audit-npo-management.component.scss']
})
export class AuditNpoManagementComponent implements IAuditCaseProperties<NpoManagement>, OnInit {
  newVersion!: NpoManagement; // don't delete or rename the property
  oldVersion!: NpoManagement; // don't delete or rename the property

  basicInfoDifferences: IValueDifference[] = [];
  contactInfoDifferences: IValueDifference[] = [];
  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this._getBasicInfoDifferences();
    this._getContactInfoDifferences();
  }

  private _getBasicInfoDifferences(): void {
    const newVersionDataModel: Partial<NpoManagement> = ObjectUtils.getControlComparisonValues<NpoManagement>(this.newVersion.getBasicInfoValuesWithLabels());
    const oldVersionDataModel: Partial<NpoManagement> = ObjectUtils.getControlComparisonValues<NpoManagement>(this.oldVersion.getBasicInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getBasicInfoValuesWithLabels());
    this.basicInfoDifferences = ObjectUtils.getValueDifferencesList<NpoManagement, NpoManagement>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }

  private _getContactInfoDifferences(): void {
    const newVersionDataModel: Partial<NpoManagement> = ObjectUtils.getControlComparisonValues<NpoManagement>(this.newVersion.getContactInfoValuesWithLabels());
    const oldVersionDataModel: Partial<NpoManagement> = ObjectUtils.getControlComparisonValues<NpoManagement>(this.oldVersion.getContactInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getContactInfoValuesWithLabels());
    this.contactInfoDifferences = ObjectUtils.getValueDifferencesList<NpoManagement, NpoManagement>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
}
