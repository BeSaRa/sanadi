import { Component, OnInit } from '@angular/core';
import { FinancialTransferTypes } from '@app/enums/financial-transfer-types.enum';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditCaseProperties } from '@app/interfaces/i-audit-case-properties';
import { IValueDifference } from '@app/interfaces/i-value-difference';
import { FinancialTransferLicensing } from '@app/models/financial-transfer-licensing';
import { LangService } from '@app/services/lang.service';

@Component({
    selector: 'audit-financial-transfers-licensing',
    templateUrl: 'audit-financial-transfers-licensing.component.html',
    styleUrls: ['audit-financial-transfers-licensing.component.scss']
})
export class AuditFinancialTransfersLicensingComponent implements IAuditCaseProperties<FinancialTransferLicensing>, OnInit {
  newVersion!: FinancialTransferLicensing; // don't delete or rename the property
  oldVersion!: FinancialTransferLicensing; // don't delete or rename the property

  basicInfoDifferences: IValueDifference[] = [];
  transferOperationDifferences: IValueDifference[] = [];
  transfereeBankAccountDifferences: IValueDifference[] = [];
  transferBankAccountDifferences: IValueDifference[] = [];
  affidavitOfCompletionDifferences: IValueDifference[] = [];
  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this._getBasicInfoDifferences();
    this._getTransferOperationDifferences();
    this._getTransfereeBankAccountDifferences();
    this._getTransferBankAccountDifferences();
    this._getAffidavitOfCompletionDifferences();
  }

  private _getBasicInfoDifferences(): void {
    const newVersionDataModel: Partial<FinancialTransferLicensing> = ObjectUtils.getControlComparisonValues<FinancialTransferLicensing>(this.newVersion.getBasicInfoValuesWithLabels());
    const oldVersionDataModel: Partial<FinancialTransferLicensing> = ObjectUtils.getControlComparisonValues<FinancialTransferLicensing>(this.oldVersion.getBasicInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getBasicInfoValuesWithLabels());
    this.basicInfoDifferences = ObjectUtils.getValueDifferencesList<FinancialTransferLicensing, FinancialTransferLicensing>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
  private _getTransferOperationDifferences(): void {
    const newVersionDataModel: Partial<FinancialTransferLicensing> = ObjectUtils.getControlComparisonValues<FinancialTransferLicensing>(this.newVersion.getTransferOperationValuesWithLabels());
    const oldVersionDataModel: Partial<FinancialTransferLicensing> = ObjectUtils.getControlComparisonValues<FinancialTransferLicensing>(this.oldVersion.getTransferOperationValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getTransferOperationValuesWithLabels());
    this.transferOperationDifferences = ObjectUtils.getValueDifferencesList<FinancialTransferLicensing, FinancialTransferLicensing>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
  private _getTransfereeBankAccountDifferences(): void {
    const newVersionDataModel: Partial<FinancialTransferLicensing> = ObjectUtils.getControlComparisonValues<FinancialTransferLicensing>(this.newVersion.getTransfereeBankAccountValuesWithLabels());
    const oldVersionDataModel: Partial<FinancialTransferLicensing> = ObjectUtils.getControlComparisonValues<FinancialTransferLicensing>(this.oldVersion.getTransfereeBankAccountValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getTransfereeBankAccountValuesWithLabels());
    this.transfereeBankAccountDifferences = ObjectUtils.getValueDifferencesList<FinancialTransferLicensing, FinancialTransferLicensing>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
  private _getTransferBankAccountDifferences(): void {
    const newVersionDataModel: Partial<FinancialTransferLicensing> = ObjectUtils.getControlComparisonValues<FinancialTransferLicensing>(this.newVersion.getTransferBankAccountValuesWithLabels());
    const oldVersionDataModel: Partial<FinancialTransferLicensing> = ObjectUtils.getControlComparisonValues<FinancialTransferLicensing>(this.oldVersion.getTransferBankAccountValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getTransferBankAccountValuesWithLabels());
    this.transferBankAccountDifferences = ObjectUtils.getValueDifferencesList<FinancialTransferLicensing, FinancialTransferLicensing>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
  private _getAffidavitOfCompletionDifferences(): void {
    const newVersionDataModel: Partial<FinancialTransferLicensing> = ObjectUtils.getControlComparisonValues<FinancialTransferLicensing>(this.newVersion.getAffidavitOfCompletionValuesWithLabels());
    const oldVersionDataModel: Partial<FinancialTransferLicensing> = ObjectUtils.getControlComparisonValues<FinancialTransferLicensing>(this.oldVersion.getAffidavitOfCompletionValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getAffidavitOfCompletionValuesWithLabels());
    this.affidavitOfCompletionDifferences = ObjectUtils.getValueDifferencesList<FinancialTransferLicensing, FinancialTransferLicensing>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
  showProjects(): boolean {
    return (
      this.newVersion.transferType ===
        FinancialTransferTypes.PROJECTS_FOR_EXECUTING_AGENCY ||
      this.newVersion.transferType === FinancialTransferTypes.PROJECTS_TO_OTHERS
    ) ||
    (
      this.oldVersion.transferType ===
        FinancialTransferTypes.PROJECTS_FOR_EXECUTING_AGENCY ||
      this.oldVersion.transferType === FinancialTransferTypes.PROJECTS_TO_OTHERS
    );
  }
}
