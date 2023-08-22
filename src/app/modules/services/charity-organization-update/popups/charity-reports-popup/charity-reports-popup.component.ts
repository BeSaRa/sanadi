import { LangService } from '@services/lang.service';
import { Component, Inject, OnInit, AfterViewInit } from '@angular/core';
import { DateUtils } from '@app/helpers/date-utils';
import { ControlWrapper } from '@app/interfaces/i-control-wrapper';
import { DatepickerOptionsMap } from '@app/types/types';
import { Lookup } from '@app/models/lookup';
import { LookupService } from '@app/services/lookup.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CharityReport } from '@app/models/charity-report';
import { AdminLookupTypeEnum } from '@app/enums/admin-lookup-type-enum';
import { AdminLookup } from '@app/models/admin-lookup';
import { AdminResult } from '@app/models/admin-result';
import { AdminLookupService } from '@app/services/admin-lookup.service';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { CommonUtils } from "@helpers/common-utils";

@Component({
  selector: 'app-charity-reports-popup',
  templateUrl: './charity-reports-popup.component.html',
  styleUrls: ['./charity-reports-popup.component.scss']
})
export class CharityReportsPopupComponent implements OnInit, AfterViewInit {
  hideFullScreen = false;
  datepickerOptionsMap: DatepickerOptionsMap = {
    generalDate: DateUtils.getDatepickerOptions({
      disablePeriod: 'none',
    }),
  };
  controls: ControlWrapper[] = [
    {
      controlName: 'fullName',
      type: 'text',
      langKey: 'report_title'
    },
    {
      controlName: 'generalDate',
      type: 'date',
      langKey: 'report_date'
    },
    {
      controlName: 'feedback',
      type: 'text',
      langKey: 'feedback'
    },
    {
      controlName: 'reportStatus',
      type: 'dropdown',
      langKey: 'status',
      load: this.lookupService.listByCategory.CharityReportStatus,
      dropdownValue: 'lookupKey',
      dropdownOptionDisabled: (optionItem: Lookup) => {
        return !optionItem.isActive();
      }
    },
  ];
  form: UntypedFormGroup;
  readonly: boolean;
  hideSave: boolean;
  editRecordIndex: number;
  model: CharityReport;
  pageTitle: keyof ILanguageKeys;

  constructor(
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      form: UntypedFormGroup,
      readonly: boolean,
      hideSave: boolean,
      editRecordIndex: number,
      model: CharityReport,
      customData: any,
    },
    private fb: UntypedFormBuilder,
    private dialogRef: DialogRef,
    public lang: LangService,
    private adminLookupService: AdminLookupService,
    private lookupService: LookupService,
  ) {
    this.form = data.form;
    this.hideSave = data.hideSave;
    this.readonly = data.readonly;
    this.editRecordIndex = data.editRecordIndex;
    this.model = data.model;
    this.pageTitle = data.customData.pageTitle
  }
  ngAfterViewInit(): void {
    this.form.patchValue({
      ...this.model,
      generalDate: DateUtils.changeDateToDatepicker(this.model.generalDate),
    });
  }

  ngOnInit() {
    if (this.pageTitle === 'risk_reports') {

      this.form = this.fb.group(this.model.buildRiskForm());
      this.controls.push(
        {
          controlName: 'riskType',
          langKey: 'risk_type',
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
          langKey: 'risk_mitigation_measures',
        },
        {
          controlName: 'category',
          langKey: 'classification',
          type: 'dropdown',
          load$: this.adminLookupService.loadAsLookups(AdminLookupTypeEnum.RISK_CLASSIFICATION),
          dropdownValue: 'id',
          dropdownOptionDisabled: (optionItem: AdminLookup) => {
            return !optionItem.isActive();
          }
        }
      );
    } else if (this.pageTitle === 'coordination_and_support_reports') {
      this.controls.push({
        controlName: 'category',
        langKey: 'classification',
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
          langKey: 'report_subject',
        },
        {
          controlName: 'procedures',
          type: 'text',
          langKey: 'procedures',
        }
      );
    } else {

      this.controls.push({
        controlName: 'subject',
        type: 'text',
        langKey: 'report_subject',
      },
        {
          controlName: 'procedures',
          type: 'text',
          langKey: 'procedures',
        });
    }


  }

  mapFormTo(form: any): CharityReport {
    const model: CharityReport = new CharityReport().clone({ itemId: this.model.itemId, ...form });
    model.reportStatusInfo = AdminResult.createInstance({ ...this.lookupService.listByCategory.CharityReportStatus.find(e => e.lookupKey === model.reportStatus) });
    model.generalDate = DateUtils.getDateStringFromDate(model.generalDate!)!;

    return model;
  }

  save() {
    this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
  }

  displayFormValidity(form?: UntypedFormGroup | null, element?: HTMLElement | string): void {
    CommonUtils.displayFormValidity((form || this.form), element);
  }

}
