import { Component, OnInit } from '@angular/core';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IValueDifference } from '@app/interfaces/i-value-difference';
import { UrgentInterventionFinancialNotification } from '@app/models/urgent-intervention-financial-notification';
import { LangService } from '@app/services/lang.service';

@Component({
  selector: 'app-audit-urgent-intervention-financial-notification',
  templateUrl: './audit-urgent-intervention-financial-notification.component.html',
  styleUrls: ['./audit-urgent-intervention-financial-notification.component.scss']
})
export class AuditUrgentInterventionFinancialNotificationComponent implements OnInit {
  newVersion!: UrgentInterventionFinancialNotification; // don't delete or rename the property
  oldVersion!: UrgentInterventionFinancialNotification; // don't delete or rename the property

  basicInfoDifferences: IValueDifference[] = [];
  transferDataDifferences: IValueDifference[] = [];
  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this._getBasicInfoDifferences();
    this._getTransferDataDifferences();
  }

  private _getBasicInfoDifferences(): void {
    const newVersionDataModel: Partial<UrgentInterventionFinancialNotification> = ObjectUtils.getControlComparisonValues<UrgentInterventionFinancialNotification>(this.newVersion.getBasicInfoValuesWithLabels());
    const oldVersionDataModel: Partial<UrgentInterventionFinancialNotification> = ObjectUtils.getControlComparisonValues<UrgentInterventionFinancialNotification>(this.oldVersion.getBasicInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getBasicInfoValuesWithLabels());
    this.basicInfoDifferences = ObjectUtils.getValueDifferencesList<UrgentInterventionFinancialNotification, UrgentInterventionFinancialNotification>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
  private _getTransferDataDifferences(): void {
    const newVersionDataModel: Partial<UrgentInterventionFinancialNotification> = ObjectUtils.getControlComparisonValues<UrgentInterventionFinancialNotification>(this.newVersion.getTransferDataValuesWithLabels());
    const oldVersionDataModel: Partial<UrgentInterventionFinancialNotification> = ObjectUtils.getControlComparisonValues<UrgentInterventionFinancialNotification>(this.oldVersion.getTransferDataValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getTransferDataValuesWithLabels());
    this.transferDataDifferences = ObjectUtils.getValueDifferencesList<UrgentInterventionFinancialNotification, UrgentInterventionFinancialNotification>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
}
