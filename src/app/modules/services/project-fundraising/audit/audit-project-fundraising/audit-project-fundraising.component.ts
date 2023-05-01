import { Component, OnInit } from '@angular/core';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditCaseProperties } from '@app/interfaces/i-audit-case-properties';
import { IValueDifference } from '@app/interfaces/i-value-difference';
import { ProjectFundraising } from '@app/models/project-fundraising';
import { LangService } from '@app/services/lang.service';

@Component({
  selector: 'app-audit-project-fundraising',
  templateUrl: './audit-project-fundraising.component.html',
  styleUrls: ['./audit-project-fundraising.component.scss']
})
export class AuditProjectFundraisingComponent implements IAuditCaseProperties<ProjectFundraising>, OnInit {
  newVersion!: ProjectFundraising; // don't delete or rename the property
  oldVersion!: ProjectFundraising; // don't delete or rename the property

  basicInfoDifferences: IValueDifference[] = [];
  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this._getBasicInfoDifferences();
  }

  private _getBasicInfoDifferences(): void {
    const newVersionDataModel: Partial<ProjectFundraising> = ObjectUtils.getControlComparisonValues<ProjectFundraising>(this.newVersion.getBasicInfoValuesWithLabels());
    const oldVersionDataModel: Partial<ProjectFundraising> = ObjectUtils.getControlComparisonValues<ProjectFundraising>(this.oldVersion.getBasicInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getBasicInfoValuesWithLabels());
    this.basicInfoDifferences = ObjectUtils.getValueDifferencesList<ProjectFundraising, ProjectFundraising>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }

}
