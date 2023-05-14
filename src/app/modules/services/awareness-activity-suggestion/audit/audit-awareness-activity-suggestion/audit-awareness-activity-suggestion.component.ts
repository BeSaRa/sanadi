import {Component, OnInit} from '@angular/core';
import {ObjectUtils} from '@app/helpers/object-utils';
import {IAuditCaseProperties} from '@app/interfaces/i-audit-case-properties';
import {IValueDifference} from '@app/interfaces/i-value-difference';
import {AwarenessActivitySuggestion} from '@app/models/awareness-activity-suggestion';
import {LangService} from '@app/services/lang.service';

@Component({
  selector: 'app-audit-awareness-activity-suggestion',
  templateUrl: './audit-awareness-activity-suggestion.component.html',
  styleUrls: ['./audit-awareness-activity-suggestion.component.scss']
})
export class AuditAwarenessActivitySuggestionComponent implements IAuditCaseProperties<AwarenessActivitySuggestion>, OnInit {
  newVersion!: AwarenessActivitySuggestion; // don't delete or rename the property
  oldVersion!: AwarenessActivitySuggestion; // don't delete or rename the property

  basicInfoDifferences: IValueDifference[] = [];
  contactOfficerDifferences: IValueDifference[] = [];
  beneficiariesNatureDifferences: IValueDifference[] = [];
  specialExplanationDifferences: IValueDifference[] = [];

  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this._getFormDifferences();
    this._getContactOfficerDifferences();
    this._getBeneficiariesNatureDifferences();
    this._getSpecialExplanationDifferences();

  }

  private _getFormDifferences(): void {
    const newVersionDataModel: Partial<AwarenessActivitySuggestion> = ObjectUtils.getControlComparisonValues<AwarenessActivitySuggestion>(this.newVersion.getBasicInfoFormValuesWithLabels());
    const oldVersionDataModel: Partial<AwarenessActivitySuggestion> = ObjectUtils.getControlComparisonValues<AwarenessActivitySuggestion>(this.oldVersion.getBasicInfoFormValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getBasicInfoFormValuesWithLabels());
    this.basicInfoDifferences = ObjectUtils.getValueDifferencesList<AwarenessActivitySuggestion, AwarenessActivitySuggestion>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }

  private _getContactOfficerDifferences(): void {
    const newVersionDataModel: Partial<AwarenessActivitySuggestion> = ObjectUtils.getControlComparisonValues<AwarenessActivitySuggestion>(this.newVersion.getContactOfficerValuesWithLabels());
    const oldVersionDataModel: Partial<AwarenessActivitySuggestion> = ObjectUtils.getControlComparisonValues<AwarenessActivitySuggestion>(this.oldVersion.getContactOfficerValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getContactOfficerValuesWithLabels());
    this.contactOfficerDifferences = ObjectUtils.getValueDifferencesList<AwarenessActivitySuggestion, AwarenessActivitySuggestion>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }

  private _getBeneficiariesNatureDifferences(): void {
    const newVersionDataModel: Partial<AwarenessActivitySuggestion> = ObjectUtils.getControlComparisonValues<AwarenessActivitySuggestion>(this.newVersion.getBeneficiariesNatureValuesWithLabels());
    const oldVersionDataModel: Partial<AwarenessActivitySuggestion> = ObjectUtils.getControlComparisonValues<AwarenessActivitySuggestion>(this.oldVersion.getBeneficiariesNatureValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getBeneficiariesNatureValuesWithLabels());
    this.beneficiariesNatureDifferences = ObjectUtils.getValueDifferencesList<AwarenessActivitySuggestion, AwarenessActivitySuggestion>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }

  private _getSpecialExplanationDifferences(): void {
    const newVersionDataModel: Partial<AwarenessActivitySuggestion> = ObjectUtils.getControlComparisonValues<AwarenessActivitySuggestion>(this.newVersion.getSpecialExplanationValuesWithLabels());
    const oldVersionDataModel: Partial<AwarenessActivitySuggestion> = ObjectUtils.getControlComparisonValues<AwarenessActivitySuggestion>(this.oldVersion.getSpecialExplanationValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getSpecialExplanationValuesWithLabels());
    this.specialExplanationDifferences = ObjectUtils.getValueDifferencesList<AwarenessActivitySuggestion, AwarenessActivitySuggestion>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
}
