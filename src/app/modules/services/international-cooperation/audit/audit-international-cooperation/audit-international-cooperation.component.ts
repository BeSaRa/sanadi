import { Component, OnInit } from '@angular/core';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditCaseProperties } from '@app/interfaces/i-audit-case-properties';
import { IValueDifference } from '@app/interfaces/i-value-difference';
import { InternationalCooperation } from '@app/models/international-cooperation';
import { LangService } from '@app/services/lang.service';

@Component({
    selector: 'audit-international-cooperation',
    templateUrl: 'audit-international-cooperation.component.html',
    styleUrls: ['audit-international-cooperation.component.scss']
})
export class AuditInternationalCooperationComponent implements IAuditCaseProperties<InternationalCooperation>, OnInit {
  newVersion!: InternationalCooperation; // don't delete or rename the property
  oldVersion!: InternationalCooperation; // don't delete or rename the property

  basicInfoDifferences: IValueDifference[] = [];

  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this._getBasicInfoDifferences();
  }

  private _getBasicInfoDifferences(): void {
    const newVersionDataModel: Partial<InternationalCooperation> = ObjectUtils.getControlComparisonValues<InternationalCooperation>(this.newVersion.getBasicInfoValuesWithLabels());
    const oldVersionDataModel: Partial<InternationalCooperation> = ObjectUtils.getControlComparisonValues<InternationalCooperation>(this.oldVersion.getBasicInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getBasicInfoValuesWithLabels());
    this.basicInfoDifferences = ObjectUtils.getValueDifferencesList<InternationalCooperation, InternationalCooperation>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }


}
