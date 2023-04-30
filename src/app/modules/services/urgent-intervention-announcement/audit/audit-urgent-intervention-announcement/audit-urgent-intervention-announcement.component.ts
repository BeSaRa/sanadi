import { Component, OnInit } from '@angular/core';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditCaseProperties } from '@app/interfaces/i-audit-case-properties';
import { IValueDifference } from '@app/interfaces/i-value-difference';
import { UrgentInterventionAnnouncement } from '@app/models/urgent-intervention-announcement';
import { LangService } from '@app/services/lang.service';

@Component({
  selector: 'app-audit-urgent-intervention-announcement',
  templateUrl: './audit-urgent-intervention-announcement.component.html',
  styleUrls: ['./audit-urgent-intervention-announcement.component.scss']
})
export class AuditUrgentInterventionAnnouncementComponent implements IAuditCaseProperties<UrgentInterventionAnnouncement>, OnInit {
  newVersion!: UrgentInterventionAnnouncement; // don't delete or rename the property
  oldVersion!: UrgentInterventionAnnouncement; // don't delete or rename the property

  basicInfoDifferences: IValueDifference[] = [];
  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this._getBasicInfoDifferences();
  }

  private _getBasicInfoDifferences(): void {
    const newVersionDataModel: Partial<UrgentInterventionAnnouncement> = ObjectUtils.getControlComparisonValues<UrgentInterventionAnnouncement>(this.newVersion.getBasicInfoValuesWithLabels());
    const oldVersionDataModel: Partial<UrgentInterventionAnnouncement> = ObjectUtils.getControlComparisonValues<UrgentInterventionAnnouncement>(this.oldVersion.getBasicInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getBasicInfoValuesWithLabels());
    this.basicInfoDifferences = ObjectUtils.getValueDifferencesList<UrgentInterventionAnnouncement, UrgentInterventionAnnouncement>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }

}
