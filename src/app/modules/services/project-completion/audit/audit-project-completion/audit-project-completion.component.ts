import { ProjectCompletion } from '@app/models/project-completion';
import { Component, OnInit } from '@angular/core';
import { IAuditCaseProperties } from '@app/interfaces/i-audit-case-properties';
import { IValueDifference } from '@app/interfaces/i-value-difference';
import { LangService } from '@app/services/lang.service';
import { ObjectUtils } from '@app/helpers/object-utils';

@Component({
  selector: 'app-audit-project-completion',
  templateUrl: './audit-project-completion.component.html',
  styleUrls: ['./audit-project-completion.component.scss']
})
export class AuditProjectCompletionComponent implements IAuditCaseProperties<ProjectCompletion>, OnInit {
  newVersion!: ProjectCompletion; // don't delete or rename the property
  oldVersion!: ProjectCompletion; // don't delete or rename the property

  projectLicenseInfoDifferences: IValueDifference[] = [];
  explanationDifferences: IValueDifference[] = [];
  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this._getProjectLicenseInfoDifferences();
    this._getExplanationDifferences();
  }

  private _getProjectLicenseInfoDifferences(): void {
    const newVersionDataModel: Partial<ProjectCompletion> = ObjectUtils.getControlComparisonValues<ProjectCompletion>(this.newVersion.getprojectLicenseInfoFormValuesWithLabels());
    const oldVersionDataModel: Partial<ProjectCompletion> = ObjectUtils.getControlComparisonValues<ProjectCompletion>(this.oldVersion.getprojectLicenseInfoFormValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getprojectLicenseInfoFormValuesWithLabels());
    this.projectLicenseInfoDifferences = ObjectUtils.getValueDifferencesList<ProjectCompletion, ProjectCompletion>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }

  private _getExplanationDifferences(): void {
    const newVersionDataModel: Partial<ProjectCompletion> = ObjectUtils.getControlComparisonValues<ProjectCompletion>(this.newVersion.getSpecialExplanationValuesWithLabels());
    const oldVersionDataModel: Partial<ProjectCompletion> = ObjectUtils.getControlComparisonValues<ProjectCompletion>(this.oldVersion.getSpecialExplanationValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getSpecialExplanationValuesWithLabels());
    this.explanationDifferences = ObjectUtils.getValueDifferencesList<ProjectCompletion, ProjectCompletion>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
}
