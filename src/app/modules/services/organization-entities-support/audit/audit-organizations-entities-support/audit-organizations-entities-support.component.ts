import { Component, OnInit } from '@angular/core';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditCaseProperties } from '@app/interfaces/i-audit-case-properties';
import { IValueDifference } from '@app/interfaces/i-value-difference';
import { OrganizationsEntitiesSupport } from '@app/models/organizations-entities-support';
import { LangService } from '@app/services/lang.service';

@Component({
  selector: 'app-audit-organizations-entities-support',
  templateUrl: './audit-organizations-entities-support.component.html',
  styleUrls: ['./audit-organizations-entities-support.component.scss']
})
export class AuditOrganizationsEntitiesSupportComponent  implements IAuditCaseProperties<OrganizationsEntitiesSupport>, OnInit {
  newVersion!: OrganizationsEntitiesSupport; // don't delete or rename the property
  oldVersion!: OrganizationsEntitiesSupport; // don't delete or rename the property
  basicInfoDifferences: IValueDifference[] = [];
  beneficiariesTypeDifferences: IValueDifference[] = [];
  organizationOfficerDifferences: IValueDifference[] = [];

  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this._getBasicInfoDifferences();
    this._getBeneficiariesTypeDifferences();
    this._getOrganizationOfficerDifferences();
  }
  private _getBasicInfoDifferences(): void {
    const newVersionDataModel = ObjectUtils.getControlComparisonValues<OrganizationsEntitiesSupport>(this.newVersion.getBasicInfoValuesWithLabels());
    const oldVersionDataModel = ObjectUtils.getControlComparisonValues<OrganizationsEntitiesSupport>(this.oldVersion.getBasicInfoValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getBasicInfoValuesWithLabels());
    this.basicInfoDifferences = ObjectUtils.getValueDifferencesList<OrganizationsEntitiesSupport, OrganizationsEntitiesSupport>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
  private _getBeneficiariesTypeDifferences(): void {
    const newVersionDataModel = ObjectUtils.getControlComparisonValues<OrganizationsEntitiesSupport>(this.newVersion.getBeneficiariesTypeValuesWithLabels());
    const oldVersionDataModel = ObjectUtils.getControlComparisonValues<OrganizationsEntitiesSupport>(this.oldVersion.getBeneficiariesTypeValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getBeneficiariesTypeValuesWithLabels());
    this.beneficiariesTypeDifferences = ObjectUtils.getValueDifferencesList<OrganizationsEntitiesSupport, OrganizationsEntitiesSupport>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
  private _getOrganizationOfficerDifferences(): void {
    const newVersionDataModel = ObjectUtils.getControlComparisonValues<OrganizationsEntitiesSupport>(this.newVersion.getOrganizationOfficerValuesWithLabels());
    const oldVersionDataModel = ObjectUtils.getControlComparisonValues<OrganizationsEntitiesSupport>(this.oldVersion.getOrganizationOfficerValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getOrganizationOfficerValuesWithLabels());
    this.organizationOfficerDifferences = ObjectUtils.getValueDifferencesList<OrganizationsEntitiesSupport, OrganizationsEntitiesSupport>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
}
