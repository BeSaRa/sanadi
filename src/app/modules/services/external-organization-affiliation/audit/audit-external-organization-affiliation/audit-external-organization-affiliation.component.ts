import { Component, OnInit } from '@angular/core';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditCaseProperties } from '@app/interfaces/i-audit-case-properties';
import { IValueDifference } from '@app/interfaces/i-value-difference';
import { ExternalOrgAffiliation } from '@app/models/external-org-affiliation';
import { LangService } from '@app/services/lang.service';

@Component({
    selector: 'audit-external-organization-affiliation',
    templateUrl: 'audit-external-organization-affiliation.component.html',
    styleUrls: ['audit-external-organization-affiliation.component.scss']
})
export class AuditExternalOrganizationAffiliationComponent implements IAuditCaseProperties<ExternalOrgAffiliation>, OnInit {
  newVersion!: ExternalOrgAffiliation; // don't delete or rename the property
  oldVersion!: ExternalOrgAffiliation; // don't delete or rename the property

  basicInfoDifferences: IValueDifference[] = [];
  specialExplanationDifferences: IValueDifference[] = [];
  contactOfficersColumns=['arabicName', 'englishName', 'email', 'phone', 'mobileNo', 'actions'];
  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this._getBasicInfoDifferences();
    this._specialExplanationDifferences();
  }

  private _getBasicInfoDifferences(): void {
    const newVersionDataModel: Partial<ExternalOrgAffiliation> = ObjectUtils.getControlComparisonValues<ExternalOrgAffiliation>(this.newVersion.getBasicInfoValuesWithLabels());
    const oldVersionDataModel: Partial<ExternalOrgAffiliation> = ObjectUtils.getControlComparisonValues<ExternalOrgAffiliation>(this.oldVersion.getBasicInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getBasicInfoValuesWithLabels());
    this.basicInfoDifferences = ObjectUtils.getValueDifferencesList<ExternalOrgAffiliation, ExternalOrgAffiliation>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
  private _specialExplanationDifferences(): void {
    const newVersionDataModel: Partial<ExternalOrgAffiliation> = ObjectUtils.getControlComparisonValues<ExternalOrgAffiliation>(this.newVersion.getExplanationValuesWithLabels());
    const oldVersionDataModel: Partial<ExternalOrgAffiliation> = ObjectUtils.getControlComparisonValues<ExternalOrgAffiliation>(this.oldVersion.getExplanationValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getExplanationValuesWithLabels());
    this.specialExplanationDifferences = ObjectUtils.getValueDifferencesList<ExternalOrgAffiliation, ExternalOrgAffiliation>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }

}
