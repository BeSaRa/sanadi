import {Component, OnInit} from '@angular/core';
import {CustomsExemptionRemittance} from '@models/customs-exemption-remittance';
import {IValueDifference} from '@contracts/i-value-difference';
import {LangService} from '@services/lang.service';
import {ObjectUtils} from '@helpers/object-utils';
import {IAuditCaseProperties} from '@contracts/i-audit-case-properties';

@Component({
  selector: 'audit-customs-exemption',
  templateUrl: './audit-customs-exemption.component.html',
  styleUrls: ['./audit-customs-exemption.component.scss']
})
export class AuditCustomsExemptionComponent implements IAuditCaseProperties<CustomsExemptionRemittance>, OnInit {
  newVersion!: CustomsExemptionRemittance; // don't delete or rename the property
  oldVersion!: CustomsExemptionRemittance; // don't delete or rename the property
  basicInfoDifferences: IValueDifference[] = [];

  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this._getBasicInfoDifferences();
  }

  private _getBasicInfoDifferences(): void {
    const newVersionDataModel = ObjectUtils.getControlComparisonValues<CustomsExemptionRemittance>(this.newVersion.getBasicInfoValuesWithLabels());
    const oldVersionDataModel = ObjectUtils.getControlComparisonValues<CustomsExemptionRemittance>(this.oldVersion.getBasicInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getBasicInfoValuesWithLabels());
    this.basicInfoDifferences = ObjectUtils.getValueDifferencesList<CustomsExemptionRemittance, CustomsExemptionRemittance>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
}
