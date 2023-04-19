import { Component, OnInit } from '@angular/core';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditCaseProperties } from '@app/interfaces/i-audit-case-properties';
import { IValueDifference } from '@app/interfaces/i-value-difference';
import { Inquiry } from '@app/models/inquiry';
import { LangService } from '@app/services/lang.service';

@Component({
  selector: 'app-audit-inquiry-and-complaint',
  templateUrl: './audit-inquiry-and-complaint.component.html',
  styleUrls: ['./audit-inquiry-and-complaint.component.scss']
})
export class AuditInquiryAndComplaintComponent implements IAuditCaseProperties<Inquiry>, OnInit {
  newVersion!: Inquiry; // don't delete or rename the property
  oldVersion!: Inquiry; // don't delete or rename the property
  formDifferences: IValueDifference[] = [];

  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this._getFormDifferences();
  }
  private _getFormDifferences(): void {
    const newVersionDataModel = ObjectUtils.getControlComparisonValues<Inquiry>(this.newVersion.getFormValuesWithLabels());
    const oldVersionDataModel = ObjectUtils.getControlComparisonValues<Inquiry>(this.oldVersion.getFormValuesWithLabels());
    const labelLangKeys = ObjectUtils.getControlLabels(this.newVersion.getFormValuesWithLabels());
    this.formDifferences = ObjectUtils.getValueDifferencesList<Inquiry, Inquiry>(this.newVersion, this.oldVersion, newVersionDataModel, oldVersionDataModel, labelLangKeys);
  }
}
