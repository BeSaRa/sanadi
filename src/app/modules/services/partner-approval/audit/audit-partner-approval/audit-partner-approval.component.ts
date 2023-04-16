import {Component, OnInit} from '@angular/core';
import {LangService} from '@services/lang.service';
import {IValueDifference} from '@contracts/i-value-difference';
import {PartnerApproval} from '@models/partner-approval';
import {ObjectUtils} from '@helpers/object-utils';
import {BankAccount} from '@models/bank-account';
import {IAuditCaseProperties} from '@contracts/i-audit-case-properties';

@Component({
  selector: 'audit-partner-approval-changes',
  templateUrl: './audit-partner-approval.component.html',
  styleUrls: ['./audit-partner-approval.component.scss']
})
export class AuditPartnerApprovalComponent implements IAuditCaseProperties<PartnerApproval>, OnInit {
  newVersion!: PartnerApproval; // don't delete or rename the property
  oldVersion!: PartnerApproval; // don't delete or rename the property

  basicInfoDifferences: IValueDifference[] = [];
  commercialLicenseDifferences: IValueDifference[]= [];

  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this._getBasicInfoDifferences();
    this._getCommercialLicenseDifferences();
  }

  private _getBasicInfoDifferences(): void {
    const newVersionDataModel: Partial<PartnerApproval> = ObjectUtils.getControlComparisonValues<PartnerApproval>(this.newVersion.getBasicInfoValuesWithLabels());
    const oldVersionDataModel: Partial<PartnerApproval> = ObjectUtils.getControlComparisonValues<PartnerApproval>(this.oldVersion.getBasicInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getBasicInfoValuesWithLabels());
    this.basicInfoDifferences = ObjectUtils.getValueDifferencesList<PartnerApproval, PartnerApproval>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }

  private _getCommercialLicenseDifferences(): void {
    const newVersionDataModel: Partial<PartnerApproval> = ObjectUtils.getControlComparisonValues<PartnerApproval>(this.newVersion.getCommercialLicenseValuesWithLabels());
    const oldVersionDataModel: Partial<PartnerApproval> = ObjectUtils.getControlComparisonValues<PartnerApproval>(this.oldVersion.getCommercialLicenseValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getCommercialLicenseValuesWithLabels());
    this.commercialLicenseDifferences = ObjectUtils.getValueDifferencesList<PartnerApproval, PartnerApproval>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }

}
