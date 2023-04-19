import { Component, OnInit } from '@angular/core';
import { ProfileTypes } from '@app/enums/profile-types.enum';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditCaseProperties } from '@app/interfaces/i-audit-case-properties';
import { IValueDifference } from '@app/interfaces/i-value-difference';
import { AwarenessActivitySuggestion } from '@app/models/awareness-activity-suggestion';
import { EmployeeService } from '@app/services/employee.service';
import { LangService } from '@app/services/lang.service';

@Component({
  selector: 'app-audit-awareness-activity-suggestion',
  templateUrl: './audit-awareness-activity-suggestion.component.html',
  styleUrls: ['./audit-awareness-activity-suggestion.component.scss']
})
export class AuditAwarenessActivitySuggestionComponent implements IAuditCaseProperties<AwarenessActivitySuggestion>, OnInit {
  newVersion!: AwarenessActivitySuggestion; // don't delete or rename the property
  oldVersion!: AwarenessActivitySuggestion; // don't delete or rename the property

  formDifferences: IValueDifference[] = [];
  dataOfApplicant: IValueDifference[] = [];
  contactOfficer: IValueDifference[] = [];

  constructor(
    public lang: LangService,
    public employeeService: EmployeeService,
    ) {
  }

  ngOnInit() {
    this._getFormDifferences();
    this._getDataOfApplicantDifferences();
    this._getContactOfficerDifferences();

  }

  private _getFormDifferences(): void {
    const newVersionDataModel: Partial<AwarenessActivitySuggestion> = ObjectUtils.getControlComparisonValues<AwarenessActivitySuggestion>(this.newVersion.getFormValuesWithLabels());
    const oldVersionDataModel: Partial<AwarenessActivitySuggestion> = ObjectUtils.getControlComparisonValues<AwarenessActivitySuggestion>(this.oldVersion.getFormValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getFormValuesWithLabels());
    this.formDifferences = ObjectUtils.getValueDifferencesList<AwarenessActivitySuggestion, AwarenessActivitySuggestion>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
  private _getDataOfApplicantDifferences(): void {
    const newVersionDataModel: Partial<AwarenessActivitySuggestion> = ObjectUtils.getControlComparisonValues<AwarenessActivitySuggestion>(this.newVersion.getDataOfApplicantValuesWithLabels());
    const oldVersionDataModel: Partial<AwarenessActivitySuggestion> = ObjectUtils.getControlComparisonValues<AwarenessActivitySuggestion>(this.oldVersion.getDataOfApplicantValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getDataOfApplicantValuesWithLabels());
    this.dataOfApplicant = ObjectUtils.getValueDifferencesList<AwarenessActivitySuggestion, AwarenessActivitySuggestion>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
  private _getContactOfficerDifferences(): void {
    const newVersionDataModel: Partial<AwarenessActivitySuggestion> = ObjectUtils.getControlComparisonValues<AwarenessActivitySuggestion>(this.newVersion.getContactOfficerValuesWithLabels());
    const oldVersionDataModel: Partial<AwarenessActivitySuggestion> = ObjectUtils.getControlComparisonValues<AwarenessActivitySuggestion>(this.oldVersion.getContactOfficerValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getContactOfficerValuesWithLabels());
    this.contactOfficer = ObjectUtils.getValueDifferencesList<AwarenessActivitySuggestion, AwarenessActivitySuggestion>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }

  isNonProfitProfile() {
    return this.employeeService.getProfile()?.profileType == ProfileTypes.NON_PROFIT_ORGANIZATIONS || this.newVersion?.profileType == ProfileTypes.NON_PROFIT_ORGANIZATIONS;
  }


}
