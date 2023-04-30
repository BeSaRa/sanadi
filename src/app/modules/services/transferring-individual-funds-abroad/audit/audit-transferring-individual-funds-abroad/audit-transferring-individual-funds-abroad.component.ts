import { Component, OnInit } from '@angular/core';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditCaseProperties } from '@app/interfaces/i-audit-case-properties';
import { IValueDifference } from '@app/interfaces/i-value-difference';
import { TransferringIndividualFundsAbroad } from '@app/models/transferring-individual-funds-abroad';
import { LangService } from '@app/services/lang.service';

@Component({
  selector: 'app-audit-transferring-individual-funds-abroad',
  templateUrl: './audit-transferring-individual-funds-abroad.component.html',
  styleUrls: ['./audit-transferring-individual-funds-abroad.component.scss']
})
export class AuditTransferringIndividualFundsAbroadComponent implements IAuditCaseProperties<TransferringIndividualFundsAbroad>, OnInit {
  newVersion!: TransferringIndividualFundsAbroad; // don't delete or rename the property
  oldVersion!: TransferringIndividualFundsAbroad; // don't delete or rename the property

  basicInfoDifferences: IValueDifference[] = [];
  requesterInfoDifferences: IValueDifference[] = [];
  receiverOrganizationInfoDifferences: IValueDifference[] = [];
  receiverPersonInfoDifferences: IValueDifference[] = [];
  financialTransactionInfoDifferences: IValueDifference[] = [];
  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this._getBasicInfoDifferences();
    this._getRequesterInfoDifferences();
    this._getReceiverOrganizationInfoDifferences();
    this._getReceiverPersonInfoDifferences();
    this._getFinancialTransactionInfoDifferences();
  }

  private _getBasicInfoDifferences(): void {
    const newVersionDataModel: Partial<TransferringIndividualFundsAbroad> = ObjectUtils.getControlComparisonValues<TransferringIndividualFundsAbroad>(this.newVersion.getBasicInfoValuesWithLabels());
    const oldVersionDataModel: Partial<TransferringIndividualFundsAbroad> = ObjectUtils.getControlComparisonValues<TransferringIndividualFundsAbroad>(this.oldVersion.getBasicInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getBasicInfoValuesWithLabels());
    this.basicInfoDifferences = ObjectUtils.getValueDifferencesList<TransferringIndividualFundsAbroad, TransferringIndividualFundsAbroad>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
  private _getRequesterInfoDifferences(): void {
    const newVersionDataModel: Partial<TransferringIndividualFundsAbroad> = ObjectUtils.getControlComparisonValues<TransferringIndividualFundsAbroad>(this.newVersion.getRequesterInfoValuesWithLabels());
    const oldVersionDataModel: Partial<TransferringIndividualFundsAbroad> = ObjectUtils.getControlComparisonValues<TransferringIndividualFundsAbroad>(this.oldVersion.getRequesterInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getRequesterInfoValuesWithLabels());
    this.requesterInfoDifferences = ObjectUtils.getValueDifferencesList<TransferringIndividualFundsAbroad, TransferringIndividualFundsAbroad>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
  private _getReceiverOrganizationInfoDifferences(): void {
    const newVersionDataModel: Partial<TransferringIndividualFundsAbroad> = ObjectUtils.getControlComparisonValues<TransferringIndividualFundsAbroad>(this.newVersion.getReceiverOrganizationInfoValuesWithLabels());
    const oldVersionDataModel: Partial<TransferringIndividualFundsAbroad> = ObjectUtils.getControlComparisonValues<TransferringIndividualFundsAbroad>(this.oldVersion.getReceiverOrganizationInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getReceiverOrganizationInfoValuesWithLabels());
    this.receiverOrganizationInfoDifferences = ObjectUtils.getValueDifferencesList<TransferringIndividualFundsAbroad, TransferringIndividualFundsAbroad>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
  private _getReceiverPersonInfoDifferences(): void {
    const newVersionDataModel: Partial<TransferringIndividualFundsAbroad> = ObjectUtils.getControlComparisonValues<TransferringIndividualFundsAbroad>(this.newVersion.getReceiverPersonInfoValuesWithLabels());
    const oldVersionDataModel: Partial<TransferringIndividualFundsAbroad> = ObjectUtils.getControlComparisonValues<TransferringIndividualFundsAbroad>(this.oldVersion.getReceiverPersonInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getReceiverPersonInfoValuesWithLabels());
    this.receiverPersonInfoDifferences = ObjectUtils.getValueDifferencesList<TransferringIndividualFundsAbroad, TransferringIndividualFundsAbroad>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
  private _getFinancialTransactionInfoDifferences(): void {
    const newVersionDataModel: Partial<TransferringIndividualFundsAbroad> = ObjectUtils.getControlComparisonValues<TransferringIndividualFundsAbroad>(this.newVersion.getFinancialTransactionInfoValuesWithLabels());
    const oldVersionDataModel: Partial<TransferringIndividualFundsAbroad> = ObjectUtils.getControlComparisonValues<TransferringIndividualFundsAbroad>(this.oldVersion.getFinancialTransactionInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getFinancialTransactionInfoValuesWithLabels());
    this.financialTransactionInfoDifferences = ObjectUtils.getValueDifferencesList<TransferringIndividualFundsAbroad, TransferringIndividualFundsAbroad>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
}
