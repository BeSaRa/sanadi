import { Component, OnInit } from '@angular/core';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditCaseProperties } from '@app/interfaces/i-audit-case-properties';
import { IValueDifference } from '@app/interfaces/i-value-difference';
import { ProjectModel } from '@app/models/project-model';
import { LangService } from '@app/services/lang.service';

@Component({
    selector: 'audit-project-models',
    templateUrl: 'audit-project-models.component.html',
    styleUrls: ['audit-project-models.component.scss']
})
export class AuditProjectModelsComponent implements IAuditCaseProperties<ProjectModel>, OnInit {
  newVersion!: ProjectModel; // don't delete or rename the property
  oldVersion!: ProjectModel; // don't delete or rename the property

  basicInfoDifferences: IValueDifference[] = [];
  categoryDifferences: IValueDifference[]= [];
  categoryGoalPercentDifferences: IValueDifference[]= [];
  summaryDifferences: IValueDifference[]= [];
  summaryPercentDifferences: IValueDifference[]= [];
  explanationDifferences: IValueDifference[]= [];

  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this._getBasicInfoDifferences();
    this._getCategoryDifferences();
    this._getCategoryGoalPercentDifferences();
    this._getSummaryDifferences();
    this._getSummaryPercentDifferences();
    this._getExplanationDifferences();
  }

  private _getBasicInfoDifferences(): void {
    const newVersionDataModel: Partial<ProjectModel> = ObjectUtils.getControlComparisonValues<ProjectModel>(this.newVersion.getBasicInfoValuesWithLabels());
    const oldVersionDataModel: Partial<ProjectModel> = ObjectUtils.getControlComparisonValues<ProjectModel>(this.oldVersion.getBasicInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getBasicInfoValuesWithLabels());
    this.basicInfoDifferences = ObjectUtils.getValueDifferencesList<ProjectModel, ProjectModel>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
  private _getCategoryDifferences(): void {
    const newVersionDataModel: Partial<ProjectModel> = ObjectUtils.getControlComparisonValues<ProjectModel>(this.newVersion.getCategoryValuesWithLabels());
    const oldVersionDataModel: Partial<ProjectModel> = ObjectUtils.getControlComparisonValues<ProjectModel>(this.oldVersion.getCategoryValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getCategoryValuesWithLabels());
    this.categoryDifferences = ObjectUtils.getValueDifferencesList<ProjectModel, ProjectModel>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
  private _getCategoryGoalPercentDifferences(): void {
    const newVersionDataModel: Partial<ProjectModel> = ObjectUtils.getControlComparisonValues<ProjectModel>(this.newVersion.getCategoryGoalPercentValuesWithLabels());
    const oldVersionDataModel: Partial<ProjectModel> = ObjectUtils.getControlComparisonValues<ProjectModel>(this.oldVersion.getCategoryGoalPercentValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getCategoryGoalPercentValuesWithLabels());
    this.categoryGoalPercentDifferences = ObjectUtils.getValueDifferencesList<ProjectModel, ProjectModel>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
  private _getSummaryDifferences(): void {
    const newVersionDataModel: Partial<ProjectModel> = ObjectUtils.getControlComparisonValues<ProjectModel>(this.newVersion.getSummaryValuesWithLabels());
    const oldVersionDataModel: Partial<ProjectModel> = ObjectUtils.getControlComparisonValues<ProjectModel>(this.oldVersion.getSummaryValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getSummaryValuesWithLabels());
    this.summaryDifferences = ObjectUtils.getValueDifferencesList<ProjectModel, ProjectModel>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
  private _getSummaryPercentDifferences(): void {
    const newVersionDataModel: Partial<ProjectModel> = ObjectUtils.getControlComparisonValues<ProjectModel>(this.newVersion.getSummaryPercentValuesWithLabels());
    const oldVersionDataModel: Partial<ProjectModel> = ObjectUtils.getControlComparisonValues<ProjectModel>(this.oldVersion.getSummaryPercentValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getSummaryPercentValuesWithLabels());
    this.summaryPercentDifferences = ObjectUtils.getValueDifferencesList<ProjectModel, ProjectModel>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }

  private _getExplanationDifferences(): void {
    const newVersionDataModel: Partial<ProjectModel> = ObjectUtils.getControlComparisonValues<ProjectModel>(this.newVersion.getExplanationValuesWithLabels());
    const oldVersionDataModel: Partial<ProjectModel> = ObjectUtils.getControlComparisonValues<ProjectModel>(this.oldVersion.getExplanationValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getExplanationValuesWithLabels());
    this.explanationDifferences = ObjectUtils.getValueDifferencesList<ProjectModel, ProjectModel>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
}
