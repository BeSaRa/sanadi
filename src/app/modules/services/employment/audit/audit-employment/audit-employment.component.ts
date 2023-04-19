import { Component, OnInit } from '@angular/core';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditCaseProperties } from '@app/interfaces/i-audit-case-properties';
import { IValueDifference } from '@app/interfaces/i-value-difference';
import { Employment } from '@app/models/employment';
import { LangService } from '@app/services/lang.service';

@Component({
    selector: 'audit-employment',
    templateUrl: 'audit-employment.component.html',
    styleUrls: ['audit-employment.component.scss']
})
export class AuditEmploymentComponent implements IAuditCaseProperties<Employment>, OnInit {
  newVersion!: Employment; // don't delete or rename the property
  oldVersion!: Employment; // don't delete or rename the property

  basicInfoDifferences: IValueDifference[] = [];
  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this._getBasicInfoDifferences();
  }

  private _getBasicInfoDifferences(): void {
    const newVersionDataModel: Partial<Employment> = ObjectUtils.getControlComparisonValues<Employment>(this.newVersion.getBasicInfoValuesWithLabels());
    const oldVersionDataModel: Partial<Employment> = ObjectUtils.getControlComparisonValues<Employment>(this.oldVersion.getBasicInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getBasicInfoValuesWithLabels());
    this.basicInfoDifferences = ObjectUtils.getValueDifferencesList<Employment, Employment>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }

}
