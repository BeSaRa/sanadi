import { Component, OnInit } from '@angular/core';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditCaseProperties } from '@app/interfaces/i-audit-case-properties';
import { IValueDifference } from '@app/interfaces/i-value-difference';
import { Fundraising } from '@app/models/fundraising';
import { LangService } from '@app/services/lang.service';

@Component({
    selector: 'audit-fundraising-channel-licensing',
    templateUrl: 'audit-fundraising-channel-licensing.component.html',
    styleUrls: ['audit-fundraising-channel-licensing.component.scss']
})
export class AuditFundraisingChannelLicensingComponent implements IAuditCaseProperties<Fundraising>, OnInit {
  newVersion!: Fundraising; // don't delete or rename the property
  oldVersion!: Fundraising; // don't delete or rename the property

  basicInfoDifferences: IValueDifference[] = [];
  explanationDifferences: IValueDifference[]= [];

  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this._getBasicInfoDifferences();
    this._getExplanationDifferences();
  }

  private _getBasicInfoDifferences(): void {
    const newVersionDataModel: Partial<Fundraising> = ObjectUtils.getControlComparisonValues<Fundraising>(this.newVersion.getBasicInfoValuesWithLabels());
    const oldVersionDataModel: Partial<Fundraising> = ObjectUtils.getControlComparisonValues<Fundraising>(this.oldVersion.getBasicInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getBasicInfoValuesWithLabels());
    this.basicInfoDifferences = ObjectUtils.getValueDifferencesList<Fundraising, Fundraising>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }

  private _getExplanationDifferences(): void {
    const newVersionDataModel: Partial<Fundraising> = ObjectUtils.getControlComparisonValues<Fundraising>(this.newVersion.getExplanationValuesWithLabels());
    const oldVersionDataModel: Partial<Fundraising> = ObjectUtils.getControlComparisonValues<Fundraising>(this.oldVersion.getExplanationValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getExplanationValuesWithLabels());
    this.explanationDifferences = ObjectUtils.getValueDifferencesList<Fundraising, Fundraising>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }

}
