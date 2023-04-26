import { Component, OnInit } from '@angular/core';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IValueDifference } from '@app/interfaces/i-value-difference';
import { UrgentInterventionLicense } from '@app/models/urgent-intervention-license';
import { LangService } from '@app/services/lang.service';

@Component({
  selector: 'app-audit-urgent-intervention-license',
  templateUrl: './audit-urgent-intervention-license.component.html',
  styleUrls: ['./audit-urgent-intervention-license.component.scss']
})
export class AuditUrgentInterventionLicenseComponent implements OnInit {
  newVersion!: UrgentInterventionLicense; // don't delete or rename the property
  oldVersion!: UrgentInterventionLicense; // don't delete or rename the property

  basicInfoDifferences: IValueDifference[] = [];
  emergencyFundDifferences: IValueDifference[] = [];
  projectSummaryDifferences: IValueDifference[] = [];
  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this._getBasicInfoDifferences();
    this._getEmergencyFundDifferences();
    this._getProjectSummaryDifferences();
  }

  private _getBasicInfoDifferences(): void {
    const newVersionDataModel: Partial<UrgentInterventionLicense> = ObjectUtils.getControlComparisonValues<UrgentInterventionLicense>(this.newVersion.getBasicInfoValuesWithLabels());
    const oldVersionDataModel: Partial<UrgentInterventionLicense> = ObjectUtils.getControlComparisonValues<UrgentInterventionLicense>(this.oldVersion.getBasicInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getBasicInfoValuesWithLabels());
    this.basicInfoDifferences = ObjectUtils.getValueDifferencesList<UrgentInterventionLicense, UrgentInterventionLicense>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
  private _getEmergencyFundDifferences(): void {
    const newVersionDataModel: Partial<UrgentInterventionLicense> = ObjectUtils.getControlComparisonValues<UrgentInterventionLicense>(this.newVersion.getEmergencyFundValuesWithLabels());
    const oldVersionDataModel: Partial<UrgentInterventionLicense> = ObjectUtils.getControlComparisonValues<UrgentInterventionLicense>(this.oldVersion.getEmergencyFundValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getEmergencyFundValuesWithLabels());
    this.emergencyFundDifferences = ObjectUtils.getValueDifferencesList<UrgentInterventionLicense, UrgentInterventionLicense>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
  private _getProjectSummaryDifferences(): void {
    const newVersionDataModel: Partial<UrgentInterventionLicense> = ObjectUtils.getControlComparisonValues<UrgentInterventionLicense>(this.newVersion.getProjectSummaryValuesWithLabels());
    const oldVersionDataModel: Partial<UrgentInterventionLicense> = ObjectUtils.getControlComparisonValues<UrgentInterventionLicense>(this.oldVersion.getProjectSummaryValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getProjectSummaryValuesWithLabels());
    this.projectSummaryDifferences = ObjectUtils.getValueDifferencesList<UrgentInterventionLicense, UrgentInterventionLicense>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
}
