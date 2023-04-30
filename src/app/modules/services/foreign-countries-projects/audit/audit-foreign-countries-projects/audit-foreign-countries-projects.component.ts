import { Component, OnInit } from '@angular/core';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditCaseProperties } from '@app/interfaces/i-audit-case-properties';
import { IValueDifference } from '@app/interfaces/i-value-difference';
import { ForeignCountriesProjects } from '@app/models/foreign-countries-projects';
import { LangService } from '@app/services/lang.service';

@Component({
    selector: 'audit-foreign-countries-projects',
    templateUrl: 'audit-foreign-countries-projects.component.html',
    styleUrls: ['audit-foreign-countries-projects.component.scss']
})
export class AuditForeignCountriesProjectsComponent implements IAuditCaseProperties<ForeignCountriesProjects>, OnInit {
  newVersion!: ForeignCountriesProjects; // don't delete or rename the property
  oldVersion!: ForeignCountriesProjects; // don't delete or rename the property

  basicInfoDifferences: IValueDifference[] = [];
  explanationDifferences: IValueDifference[]= [];

  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this._getBasicInfoDifferences();
    this._getExplanationDifferences();
  }

  private _getBasicInfoDifferences(): void {
    const newVersionDataModel: Partial<ForeignCountriesProjects> = ObjectUtils.getControlComparisonValues<ForeignCountriesProjects>(this.newVersion.getBasicInfoValuesWithLabels());
    const oldVersionDataModel: Partial<ForeignCountriesProjects> = ObjectUtils.getControlComparisonValues<ForeignCountriesProjects>(this.oldVersion.getBasicInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getBasicInfoValuesWithLabels());
    this.basicInfoDifferences = ObjectUtils.getValueDifferencesList<ForeignCountriesProjects, ForeignCountriesProjects>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }

  private _getExplanationDifferences(): void {
    const newVersionDataModel: Partial<ForeignCountriesProjects> = ObjectUtils.getControlComparisonValues<ForeignCountriesProjects>(this.newVersion.getExplanationValuesWithLabels());
    const oldVersionDataModel: Partial<ForeignCountriesProjects> = ObjectUtils.getControlComparisonValues<ForeignCountriesProjects>(this.oldVersion.getExplanationValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getExplanationValuesWithLabels());
    this.explanationDifferences = ObjectUtils.getValueDifferencesList<ForeignCountriesProjects, ForeignCountriesProjects>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }

}
