import {Component, Input} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {AdminLookupTypeEnum} from '@enums/admin-lookup-type-enum';
import {ListModelComponent} from '@app/generics/ListModel-component';
import {DateUtils} from '@helpers/date-utils';
import {ControlWrapper} from '@contracts/i-control-wrapper';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {AdminResult} from '@models/admin-result';
import {CharityReport} from '@models/charity-report';
import {AdminLookupService} from '@services/admin-lookup.service';
import {LangService} from '@services/lang.service';
import {LookupService} from '@services/lookup.service';
import {ToastService} from '@services/toast.service';
import {DatepickerOptionsMap} from '@app/types/types';
import {Lookup} from '@models/lookup';
import {AdminLookup} from '@models/admin-lookup';
import { ComponentType } from '@angular/cdk/portal';

@Component({
  selector: 'charity-reports',
  templateUrl: './charity-reports.component.html',
  styleUrls: ['./charity-reports.component.scss'],
})
export class CharityReportsComponent extends ListModelComponent<CharityReport> {
  protected _getPopupComponent(): ComponentType<any> {
    throw new Error('Method not implemented.');
  }
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
      dropdownOptionDisabled: (optionItem: Lookup) => {
        return !optionItem.isActive();
      }
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
    model.reportStatusInfo = AdminResult.createInstance({...this.lookupService.listByCategory.CharityReportStatus.find(e => e.lookupKey === model.reportStatus)});
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
          load$: this.adminLookupService.loadAsLookups(AdminLookupTypeEnum.RISK_TYPE),
          dropdownValue: 'id',
          dropdownOptionDisabled: (optionItem: AdminLookup) => {
            return !optionItem.isActive();
          }
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
          load$: this.adminLookupService.loadAsLookups(AdminLookupTypeEnum.RISK_CLASSIFICATION),
          dropdownValue: 'id',
          dropdownOptionDisabled: (optionItem: AdminLookup) => {
            return !optionItem.isActive();
          }
        }
      );
    } else if (this.pageTitle === 'coordination_and_support_reports') {

      this.form = this.fb.group(this.model.buildSupportForm());
      this.controls.push({
          controlName: 'category',
          label: this.lang.map.classification,
          type: 'dropdown',
          load$: this.adminLookupService.loadAsLookups(AdminLookupTypeEnum.COORDINATION_SUPPORT_CLASSIFICATION),
          dropdownValue: 'id',
          dropdownOptionDisabled: (optionItem: AdminLookup) => {
            return !optionItem.isActive();
          }
        },
        {
          controlName: 'subject',
          type: 'text',
          label: this.lang.map.report_subject,
        },
        {
          controlName: 'procedures',
          type: 'text',
          label: this.lang.map.procedures
        }
      );
    } else {

      this.form = this.fb.group(this.model.buildFormWithSubject());
      this.controls.push({
        controlName: 'subject',
        type: 'text',
        label: this.lang.map.report_subject,
      }, {
        controlName: 'procedures',
        type: 'text',
        label: this.lang.map.procedures
      });
    }
  }
}
