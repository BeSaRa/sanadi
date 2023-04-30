import { Component, OnInit } from '@angular/core';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IValueDifference } from '@app/interfaces/i-value-difference';
import { UrgentInterventionClosure } from '@app/models/urgent-intervention-closure';
import { LangService } from '@app/services/lang.service';

@Component({
  selector: 'app-audit-urgent-intervention-closure',
  templateUrl: './audit-urgent-intervention-closure.component.html',
  styleUrls: ['./audit-urgent-intervention-closure.component.scss']
})
export class AuditUrgentInterventionClosureComponent implements OnInit {
  newVersion!: UrgentInterventionClosure; // don't delete or rename the property
  oldVersion!: UrgentInterventionClosure; // don't delete or rename the property

  basicInfoDifferences: IValueDifference[] = [];
  beneficiaryAnalysisDifferences: IValueDifference[] = [];
  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this._getBasicInfoDifferences();
    this._getBeneficiaryAnalysisDifferences();
  }

  private _getBasicInfoDifferences(): void {
    const newVersionDataModel: Partial<UrgentInterventionClosure> = ObjectUtils.getControlComparisonValues<UrgentInterventionClosure>(this.newVersion.getBasicInfoValuesWithLabels());
    const oldVersionDataModel: Partial<UrgentInterventionClosure> = ObjectUtils.getControlComparisonValues<UrgentInterventionClosure>(this.oldVersion.getBasicInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getBasicInfoValuesWithLabels());
    this.basicInfoDifferences = ObjectUtils.getValueDifferencesList<UrgentInterventionClosure, UrgentInterventionClosure>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
  private _getBeneficiaryAnalysisDifferences(): void {
    const newVersionDataModel: Partial<UrgentInterventionClosure> = ObjectUtils.getControlComparisonValues<UrgentInterventionClosure>(this.newVersion.getBeneficiaryAnalysisValuesWithLabels());
    const oldVersionDataModel: Partial<UrgentInterventionClosure> = ObjectUtils.getControlComparisonValues<UrgentInterventionClosure>(this.oldVersion.getBeneficiaryAnalysisValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getBeneficiaryAnalysisValuesWithLabels());
    this.beneficiaryAnalysisDifferences = ObjectUtils.getValueDifferencesList<UrgentInterventionClosure, UrgentInterventionClosure>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
}
