import { Component, OnInit } from '@angular/core';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditCaseProperties } from '@app/interfaces/i-audit-case-properties';
import { IValueDifference } from '@app/interfaces/i-value-difference';
import { GeneralProcessNotification } from '@app/models/general-process-notification';
import { LangService } from '@app/services/lang.service';

@Component({
    selector: 'audit-general-process-notification',
    templateUrl: 'audit-general-process-notification.component.html',
    styleUrls: ['audit-general-process-notification.component.scss']
})
export class AuditGeneralProcessNotificationComponent implements IAuditCaseProperties<GeneralProcessNotification>, OnInit {
  newVersion!: GeneralProcessNotification; // don't delete or rename the property
  oldVersion!: GeneralProcessNotification; // don't delete or rename the property

  basicInfoDifferences: IValueDifference[] = [];
  dSNNNDifferences: IValueDifference[] = [];
  explanationDifferences: IValueDifference[]= [];

  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this._getBasicInfoDifferences();
    this._getDSNNNDifferences();
    this._getExplanationDifferences();
  }

  private _getBasicInfoDifferences(): void {
    const newVersionDataModel: Partial<GeneralProcessNotification> = ObjectUtils.getControlComparisonValues<GeneralProcessNotification>(this.newVersion.getBasicInfoValuesWithLabels());
    const oldVersionDataModel: Partial<GeneralProcessNotification> = ObjectUtils.getControlComparisonValues<GeneralProcessNotification>(this.oldVersion.getBasicInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getBasicInfoValuesWithLabels());
    this.basicInfoDifferences = ObjectUtils.getValueDifferencesList<GeneralProcessNotification, GeneralProcessNotification>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
  private _getDSNNNDifferences(): void {
    const newVersionDataModel: Partial<GeneralProcessNotification> = ObjectUtils.getControlComparisonValues<GeneralProcessNotification>(this.newVersion.getDSNNNValuesWithLabels());
    const oldVersionDataModel: Partial<GeneralProcessNotification> = ObjectUtils.getControlComparisonValues<GeneralProcessNotification>(this.oldVersion.getDSNNNValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getDSNNNValuesWithLabels());
    this.dSNNNDifferences = ObjectUtils.getValueDifferencesList<GeneralProcessNotification, GeneralProcessNotification>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }

  private _getExplanationDifferences(): void {
    const newVersionDataModel: Partial<GeneralProcessNotification> = ObjectUtils.getControlComparisonValues<GeneralProcessNotification>(this.newVersion.getExplanationValuesWithLabels());
    const oldVersionDataModel: Partial<GeneralProcessNotification> = ObjectUtils.getControlComparisonValues<GeneralProcessNotification>(this.oldVersion.getExplanationValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getExplanationValuesWithLabels());
    this.explanationDifferences = ObjectUtils.getValueDifferencesList<GeneralProcessNotification, GeneralProcessNotification>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
}
