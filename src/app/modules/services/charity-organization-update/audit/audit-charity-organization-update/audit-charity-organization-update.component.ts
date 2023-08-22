import { CharityReportType } from './../../../../../enums/charity-report-type.enum';
import { Component, OnInit } from '@angular/core';
import { CharityUpdateSection } from '@app/enums/charity-update-section.enum';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditCaseProperties } from '@app/interfaces/i-audit-case-properties';
import { IValueDifference } from '@app/interfaces/i-value-difference';
import { CharityOrganizationUpdate } from '@app/models/charity-organization-update';
import { LangService } from '@app/services/lang.service';

@Component({
    selector: 'audit-charity-organization-update',
    templateUrl: 'audit-charity-organization-update.component.html',
    styleUrls: ['audit-charity-organization-update.component.scss']
})
export class AuditCharityOrganizationUpdateComponent implements IAuditCaseProperties<CharityOrganizationUpdate>, OnInit {
  charityUpdateSection = CharityUpdateSection;
  newVersion!: CharityOrganizationUpdate; // don't delete or rename the property
  oldVersion!: CharityOrganizationUpdate; // don't delete or rename the property
  charityReportType = CharityReportType;
  basicInfoDifferences: IValueDifference[] = [];
  metaDataDifferences: IValueDifference[] = [];
  contactInformationDifferences: IValueDifference[] = [];
  primaryLawDifferences: IValueDifference[] = [];

  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this._getBasicInfoDifferences();
    this._getMetaDataDifferences();
    this._getContactInformationDifferences();
    this._getPrimaryLawDifferences();
  }

  private _getBasicInfoDifferences(): void {
    const newVersionDataModel: Partial<CharityOrganizationUpdate> = ObjectUtils.getControlComparisonValues<CharityOrganizationUpdate>(this.newVersion.getSectionValuesWithLabels());
    const oldVersionDataModel: Partial<CharityOrganizationUpdate> = ObjectUtils.getControlComparisonValues<CharityOrganizationUpdate>(this.oldVersion.getSectionValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getSectionValuesWithLabels());
    this.basicInfoDifferences = ObjectUtils.getValueDifferencesList<CharityOrganizationUpdate, CharityOrganizationUpdate>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
  private _getMetaDataDifferences(): void {
    const newVersionDataModel: Partial<CharityOrganizationUpdate> = ObjectUtils.getControlComparisonValues<CharityOrganizationUpdate>(this.newVersion.getMetaDataValuesWithLabels());
    const oldVersionDataModel: Partial<CharityOrganizationUpdate> = ObjectUtils.getControlComparisonValues<CharityOrganizationUpdate>(this.oldVersion.getMetaDataValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getMetaDataValuesWithLabels());
    this.metaDataDifferences = ObjectUtils.getValueDifferencesList<CharityOrganizationUpdate, CharityOrganizationUpdate>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
  private _getContactInformationDifferences(): void {
    const newVersionDataModel: Partial<CharityOrganizationUpdate> = ObjectUtils.getControlComparisonValues<CharityOrganizationUpdate>(this.newVersion.getContactInformationValuesWithLabels());
    const oldVersionDataModel: Partial<CharityOrganizationUpdate> = ObjectUtils.getControlComparisonValues<CharityOrganizationUpdate>(this.oldVersion.getContactInformationValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getContactInformationValuesWithLabels());
    this.contactInformationDifferences = ObjectUtils.getValueDifferencesList<CharityOrganizationUpdate, CharityOrganizationUpdate>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
  private _getPrimaryLawDifferences(): void {
    const newVersionDataModel: Partial<CharityOrganizationUpdate> = ObjectUtils.getControlComparisonValues<CharityOrganizationUpdate>(this.newVersion.getPrimaryLawValuesWithLabels());
    const oldVersionDataModel: Partial<CharityOrganizationUpdate> = ObjectUtils.getControlComparisonValues<CharityOrganizationUpdate>(this.oldVersion.getPrimaryLawValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getPrimaryLawValuesWithLabels());
    this.primaryLawDifferences = ObjectUtils.getValueDifferencesList<CharityOrganizationUpdate, CharityOrganizationUpdate>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }

}
