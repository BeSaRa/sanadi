import { IValueDifference } from '@contracts/i-value-difference';
import { Component, OnInit } from '@angular/core';
import { ObjectUtils } from '@app/helpers/object-utils';
import { LangService } from '@app/services/lang.service';
import { IAuditCaseProperties } from '@app/interfaces/i-audit-case-properties';
import { ProjectImplementation } from '@app/models/project-implementation';

@Component({
  selector: 'app-audit-project-implementation',
  templateUrl: './audit-project-implementation.component.html',
  styleUrls: ['./audit-project-implementation.component.scss']
})
export class AuditProjectImplementationComponent implements IAuditCaseProperties<ProjectImplementation>, OnInit {
  newVersion!: ProjectImplementation; // don't delete or rename the property
  oldVersion!: ProjectImplementation; // don't delete or rename the property

  basicInfoDifferences: IValueDifference[] = [];
  implementingAgencyTypeDifferences: IValueDifference[] = [];
  explanationDifferences: IValueDifference[] = [];

  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this._getBasicInfoDifferences();
    this._getimplementingAgencyTypeDifferences();
    this._getExplanationDifferences();
  }

  private _getBasicInfoDifferences(): void {
    const newVersionDataModel: Partial<ProjectImplementation> = ObjectUtils.getControlComparisonValues<ProjectImplementation>(this.newVersion.getBasicInfoValuesWithLabels());
    const oldVersionDataModel: Partial<ProjectImplementation> = ObjectUtils.getControlComparisonValues<ProjectImplementation>(this.oldVersion.getBasicInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getBasicInfoValuesWithLabels());
    this.basicInfoDifferences = ObjectUtils.getValueDifferencesList<ProjectImplementation, ProjectImplementation>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
  private _getimplementingAgencyTypeDifferences(): void {
    const newVersionDataModel: Partial<ProjectImplementation> = ObjectUtils.getControlComparisonValues<ProjectImplementation>(this.newVersion.getimplementingAgencyTypeValuesWithLabels());
    const oldVersionDataModel: Partial<ProjectImplementation> = ObjectUtils.getControlComparisonValues<ProjectImplementation>(this.oldVersion.getimplementingAgencyTypeValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getimplementingAgencyTypeValuesWithLabels());
    this.implementingAgencyTypeDifferences = ObjectUtils.getValueDifferencesList<ProjectImplementation, ProjectImplementation>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }

  private _getExplanationDifferences(): void {
    const newVersionDataModel: Partial<ProjectImplementation> = ObjectUtils.getControlComparisonValues<ProjectImplementation>(this.newVersion.getExplanationValuesWithLabels());
    const oldVersionDataModel: Partial<ProjectImplementation> = ObjectUtils.getControlComparisonValues<ProjectImplementation>(this.oldVersion.getExplanationValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getExplanationValuesWithLabels());
    this.explanationDifferences = ObjectUtils.getValueDifferencesList<ProjectImplementation, ProjectImplementation>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
}
