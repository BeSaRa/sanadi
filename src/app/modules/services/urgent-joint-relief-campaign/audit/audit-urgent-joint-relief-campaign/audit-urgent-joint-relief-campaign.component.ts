import { Component, OnInit } from '@angular/core';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditCaseProperties } from '@app/interfaces/i-audit-case-properties';
import { IValueDifference } from '@app/interfaces/i-value-difference';
import { UrgentJointReliefCampaign } from '@app/models/urgent-joint-relief-campaign';
import { LangService } from '@app/services/lang.service';

@Component({
  selector: 'app-audit-urgent-joint-relief-campaign',
  templateUrl: './audit-urgent-joint-relief-campaign.component.html',
  styleUrls: ['./audit-urgent-joint-relief-campaign.component.scss']
})
export class AuditUrgentJointReliefCampaignComponent implements IAuditCaseProperties<UrgentJointReliefCampaign>, OnInit {
  newVersion!: UrgentJointReliefCampaign; // don't delete or rename the property
  oldVersion!: UrgentJointReliefCampaign; // don't delete or rename the property

  basicInfoDifferences: IValueDifference[] = [];
  mainInfoDifferences: IValueDifference[] = [];
  explanationDifferences: IValueDifference[] = [];

  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this._getBasicInfoDifferences();
    this._getMainInfoDifferences();
    this._getExplanationDifferences();
  }

  private _getBasicInfoDifferences(): void {
    const newVersionDataModel: Partial<UrgentJointReliefCampaign> = ObjectUtils.getControlComparisonValues<UrgentJointReliefCampaign>(this.newVersion.getBasicInfoValuesWithLabels());
    const oldVersionDataModel: Partial<UrgentJointReliefCampaign> = ObjectUtils.getControlComparisonValues<UrgentJointReliefCampaign>(this.oldVersion.getBasicInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getBasicInfoValuesWithLabels());
    this.basicInfoDifferences = ObjectUtils.getValueDifferencesList<UrgentJointReliefCampaign, UrgentJointReliefCampaign>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
  private _getMainInfoDifferences(): void {
    const newVersionDataModel: Partial<UrgentJointReliefCampaign> = ObjectUtils.getControlComparisonValues<UrgentJointReliefCampaign>(this.newVersion.getMainInfoValuesWithLabels());
    const oldVersionDataModel: Partial<UrgentJointReliefCampaign> = ObjectUtils.getControlComparisonValues<UrgentJointReliefCampaign>(this.oldVersion.getMainInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getMainInfoValuesWithLabels());
    this.mainInfoDifferences = ObjectUtils.getValueDifferencesList<UrgentJointReliefCampaign, UrgentJointReliefCampaign>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
  private _getExplanationDifferences(): void {
    const newVersionDataModel: Partial<UrgentJointReliefCampaign> = ObjectUtils.getControlComparisonValues<UrgentJointReliefCampaign>(this.newVersion.getExplanationValuesWithLabels());
    const oldVersionDataModel: Partial<UrgentJointReliefCampaign> = ObjectUtils.getControlComparisonValues<UrgentJointReliefCampaign>(this.oldVersion.getExplanationValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getExplanationValuesWithLabels());
    this.explanationDifferences = ObjectUtils.getValueDifferencesList<UrgentJointReliefCampaign, UrgentJointReliefCampaign>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
}
