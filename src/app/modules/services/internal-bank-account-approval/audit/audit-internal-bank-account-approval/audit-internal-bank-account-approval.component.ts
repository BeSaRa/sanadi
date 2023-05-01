import { Component, OnInit } from '@angular/core';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditCaseProperties } from '@app/interfaces/i-audit-case-properties';
import { IValueDifference } from '@app/interfaces/i-value-difference';
import { InternalBankAccountApproval } from '@app/models/internal-bank-account-approval';
import { LangService } from '@app/services/lang.service';

@Component({
    selector: 'audit-internal-bank-account-approval',
    templateUrl: 'audit-internal-bank-account-approval.component.html',
    styleUrls: ['audit-internal-bank-account-approval.component.scss']
})
export class AuditInternalBankAccountApprovalComponent implements IAuditCaseProperties<InternalBankAccountApproval>, OnInit {
  newVersion!: InternalBankAccountApproval; // don't delete or rename the property
  oldVersion!: InternalBankAccountApproval; // don't delete or rename the property

  basicInfoDifferences: IValueDifference[] = [];
  explanationDifferences: IValueDifference[]= [];

  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this._getBasicInfoDifferences();
    this._getExplanationDifferences();
  }

  private _getBasicInfoDifferences(): void {
    const newVersionDataModel: Partial<InternalBankAccountApproval> = ObjectUtils.getControlComparisonValues<InternalBankAccountApproval>(this.newVersion.getBasicInfoValuesWithLabels());
    const oldVersionDataModel: Partial<InternalBankAccountApproval> = ObjectUtils.getControlComparisonValues<InternalBankAccountApproval>(this.oldVersion.getBasicInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getBasicInfoValuesWithLabels());
    this.basicInfoDifferences = ObjectUtils.getValueDifferencesList<InternalBankAccountApproval, InternalBankAccountApproval>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }

  private _getExplanationDifferences(): void {
    const newVersionDataModel: Partial<InternalBankAccountApproval> = ObjectUtils.getControlComparisonValues<InternalBankAccountApproval>(this.newVersion.getExplanationValuesWithLabels());
    const oldVersionDataModel: Partial<InternalBankAccountApproval> = ObjectUtils.getControlComparisonValues<InternalBankAccountApproval>(this.oldVersion.getExplanationValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getExplanationValuesWithLabels());
    this.explanationDifferences = ObjectUtils.getValueDifferencesList<InternalBankAccountApproval, InternalBankAccountApproval>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
}
