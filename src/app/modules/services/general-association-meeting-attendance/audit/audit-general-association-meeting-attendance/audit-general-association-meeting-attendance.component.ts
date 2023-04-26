import { Component, OnInit } from '@angular/core';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditCaseProperties } from '@app/interfaces/i-audit-case-properties';
import { IValueDifference } from '@app/interfaces/i-value-difference';
import { GeneralAssociationMeetingAttendance } from '@app/models/general-association-meeting-attendance';
import { LangService } from '@app/services/lang.service';

@Component({
    selector: 'audit-general-association-meeting-attendance',
    templateUrl: 'audit-general-association-meeting-attendance.component.html',
    styleUrls: ['audit-general-association-meeting-attendance.component.scss']
})
export class AuditGeneralAssociationMeetingAttendanceComponent implements IAuditCaseProperties<GeneralAssociationMeetingAttendance>, OnInit {
  newVersion!: GeneralAssociationMeetingAttendance; // don't delete or rename the property
  oldVersion!: GeneralAssociationMeetingAttendance; // don't delete or rename the property

  basicInfoDifferences: IValueDifference[] = [];
  explanationDifferences: IValueDifference[]= [];

  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this._getBasicInfoDifferences();
    this._getExplanationDifferences();
  }

  private _getBasicInfoDifferences(): void {
    const newVersionDataModel: Partial<GeneralAssociationMeetingAttendance> = ObjectUtils.getControlComparisonValues<GeneralAssociationMeetingAttendance>(this.newVersion.getBasicInfoValuesWithLabels());
    const oldVersionDataModel: Partial<GeneralAssociationMeetingAttendance> = ObjectUtils.getControlComparisonValues<GeneralAssociationMeetingAttendance>(this.oldVersion.getBasicInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getBasicInfoValuesWithLabels());
    this.basicInfoDifferences = ObjectUtils.getValueDifferencesList<GeneralAssociationMeetingAttendance, GeneralAssociationMeetingAttendance>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }

  private _getExplanationDifferences(): void {
    const newVersionDataModel: Partial<GeneralAssociationMeetingAttendance> = ObjectUtils.getControlComparisonValues<GeneralAssociationMeetingAttendance>(this.newVersion.getExplanationValuesWithLabels());
    const oldVersionDataModel: Partial<GeneralAssociationMeetingAttendance> = ObjectUtils.getControlComparisonValues<GeneralAssociationMeetingAttendance>(this.oldVersion.getExplanationValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getExplanationValuesWithLabels());
    this.explanationDifferences = ObjectUtils.getValueDifferencesList<GeneralAssociationMeetingAttendance, GeneralAssociationMeetingAttendance>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }

}
