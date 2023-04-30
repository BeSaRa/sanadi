import { Component, OnInit } from '@angular/core';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditCaseProperties } from '@app/interfaces/i-audit-case-properties';
import { IValueDifference } from '@app/interfaces/i-value-difference';
import { CoordinationWithOrganizationsRequest } from '@app/models/coordination-with-organizations-request';
import { LangService } from '@app/services/lang.service';

@Component({
    selector: 'audit-coordination-with-organization-request',
    templateUrl: 'audit-coordination-with-organization-request.component.html',
    styleUrls: ['audit-coordination-with-organization-request.component.scss']
})
export class AuditCoordinationWithOrganizationRequestComponent implements IAuditCaseProperties<CoordinationWithOrganizationsRequest>, OnInit {
  newVersion!: CoordinationWithOrganizationsRequest; // don't delete or rename the property
  oldVersion!: CoordinationWithOrganizationsRequest; // don't delete or rename the property

  basicInfoDifferences: IValueDifference[] = [];
  explanationDifferences: IValueDifference[]= [];

  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this._getBasicInfoDifferences();
    this._getExplanationDifferences();
  }

  private _getBasicInfoDifferences(): void {
    const newVersionDataModel: Partial<CoordinationWithOrganizationsRequest> = ObjectUtils.getControlComparisonValues<CoordinationWithOrganizationsRequest>(this.newVersion.getBasicInfoValuesWithLabels());
    const oldVersionDataModel: Partial<CoordinationWithOrganizationsRequest> = ObjectUtils.getControlComparisonValues<CoordinationWithOrganizationsRequest>(this.oldVersion.getBasicInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getBasicInfoValuesWithLabels());
    this.basicInfoDifferences = ObjectUtils.getValueDifferencesList<CoordinationWithOrganizationsRequest, CoordinationWithOrganizationsRequest>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }

  private _getExplanationDifferences(): void {
    const newVersionDataModel: Partial<CoordinationWithOrganizationsRequest> = ObjectUtils.getControlComparisonValues<CoordinationWithOrganizationsRequest>(this.newVersion.getExplanationValuesWithLabels());
    const oldVersionDataModel: Partial<CoordinationWithOrganizationsRequest> = ObjectUtils.getControlComparisonValues<CoordinationWithOrganizationsRequest>(this.oldVersion.getExplanationValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getExplanationValuesWithLabels());
    this.explanationDifferences = ObjectUtils.getValueDifferencesList<CoordinationWithOrganizationsRequest, CoordinationWithOrganizationsRequest>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
}
