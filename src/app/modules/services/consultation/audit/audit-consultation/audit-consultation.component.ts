import { Component, OnInit } from '@angular/core';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditCaseProperties } from '@app/interfaces/i-audit-case-properties';
import { IValueDifference } from '@app/interfaces/i-value-difference';
import { Consultation } from '@app/models/consultation';
import { LangService } from '@app/services/lang.service';

@Component({
  selector: 'app-audit-consultation',
  templateUrl: './audit-consultation.component.html',
  styleUrls: ['./audit-consultation.component.scss']
})
export class AuditConsultationComponent implements IAuditCaseProperties<Consultation>, OnInit {
  newVersion!: Consultation; // don't delete or rename the property
  oldVersion!: Consultation; // don't delete or rename the property

  basicInfoDifferences: IValueDifference[] = [];
  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this._getBasicInfoDifferences();
  }

  private _getBasicInfoDifferences(): void {
    const newVersionDataModel: Partial<Consultation> = ObjectUtils.getControlComparisonValues<Consultation>(this.newVersion.getBasicInfoValuesWithLabels());
    const oldVersionDataModel: Partial<Consultation> = ObjectUtils.getControlComparisonValues<Consultation>(this.oldVersion.getBasicInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getBasicInfoValuesWithLabels());
    this.basicInfoDifferences = ObjectUtils.getValueDifferencesList<Consultation, Consultation>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }

}
