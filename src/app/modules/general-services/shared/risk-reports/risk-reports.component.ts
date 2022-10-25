import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { AdminLookupTypeEnum } from '@app/enums/admin-lookup-type-enum';
import { ListModelComponent } from '@app/generics/ListModel-component';
import { DateUtils } from '@app/helpers/date-utils';
import { ControlWrapper } from '@app/interfaces/i-control-wrapper';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { AdminResult } from '@app/models/admin-result';
import { CharityReport } from '@app/models/charity-report';
import { AdminLookupService } from '@app/services/admin-lookup.service';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { ToastService } from '@app/services/toast.service';
import { DatepickerOptionsMap } from '@app/types/types';

@Component({
  selector: 'charity-reports',
  templateUrl: './risk-reports.component.html',
  styleUrls: ['./risk-reports.component.scss'],
})
export class CharityReportsComponent extends ListModelComponent<CharityReport> {
  get list() {
    return this._list;
  }
  @Input() set list(_list: CharityReport[]) {
    this._list = _list;
  }
  @Input() readonly!: boolean;
  @Input() pageTitle!: keyof ILanguageKeys;
  datepickerOptionsMap: DatepickerOptionsMap = {
    generalDate: DateUtils.getDatepickerOptions({
      disablePeriod: 'none',
    }),
  };
  form!: UntypedFormGroup;
  columns = [
    'fullName',
    'generalDate',
    'feedback',
    'reportStatus',
    'actions',
  ];
  controls: ControlWrapper[] = [
    {
      controlName: 'fullName',
      type: 'text',
      label: this.lang.map.report_title,
    },
    {
      controlName: 'generalDate',
      type: 'date',
      label: this.lang.map.report_date,
    },
    {
      controlName: 'feedback',
      type: 'text',
      label: this.lang.map.feedback,
    },
    {
      controlName: 'reportStatus',
      type: 'dropdown',
      label: this.lang.map.status,
      load: this.lookupService.listByCategory.CharityReportStatus,
      dropdownValue: 'lookupKey',
    },
  ];
  constructor(
    private fb: UntypedFormBuilder,
    public lang: LangService,
    private adminLookupService: AdminLookupService,
    private lookupService: LookupService,
    private toastr: ToastService
  ) {
    super(CharityReport);
  }
  _beforeAdd(model: CharityReport): CharityReport | null {
    if (
      this._list.findIndex((e) => e.fullName === model.fullName) !== -1 &&
      this.editRecordIndex === -1
    ) {
      this.toastr.alert(this.lang.map.msg_duplicated_item);
      return null;
    }
    model.generalDate = DateUtils.getDateStringFromDate(model.generalDate!)!;
    return model;
  }
  _selectOne(row: CharityReport): void {
    this.form.patchValue({
      ...row,
      generalDate: DateUtils.changeDateToDatepicker(row.generalDate),
    });
  }
  protected _initComponent(): void {
    if (this.pageTitle === 'risk_reports') {

      this.form = this.fb.group(this.model.buildRiskForm());
      this.controls.push(
        {
          controlName: 'riskType',
          label: this.lang.map.risk_type,
          type: 'dropdown',
          load$: this.adminLookupService.loadAsLookups(
            AdminLookupTypeEnum.RISK_TYPE
          ),
          dropdownValue: 'id',
        },
        {
          controlName: 'riskMitigationMeasures',
          type: 'text',
          label: this.lang.map.risk_mitigation_measures,
        },
        {
          controlName: 'category',
          label: this.lang.map.classification,
          type: 'dropdown',
          load$: this.adminLookupService.loadAsLookups(
            AdminLookupTypeEnum.RISK_CLASSIFICATION
          ),
          dropdownValue: 'id',
        }
      );
    }
    else if (this.pageTitle === 'coordination_and_support_reports') {

      this.form = this.fb.group(this.model.buildSupportForm());
      this.controls.push({
        controlName: 'category',
        label: this.lang.map.classification,
        type: 'dropdown',
        load$: this.adminLookupService.loadAsLookups(
          AdminLookupTypeEnum.COORDINATION_SUPPORT_CLASSIFICATION
        ),
        dropdownValue: 'id',
      }, {
        controlName: 'subject',
        type: 'text',
        label: this.lang.map.report_subject,
      }, {
        controlName: 'procedures',
        type: 'text',
        label: this.lang.map.procedures
      }
      );
    }
    else {

      this.form = this.fb.group(this.model.buildFormWithSubject());
      this.controls.push({
        controlName: 'subject',
        type: 'text',
        label: this.lang.map.report_subject,
      }, {
        controlName: 'procedures',
        type: 'text',
        label: this.lang.map.procedures
      })
    }
  }
}
