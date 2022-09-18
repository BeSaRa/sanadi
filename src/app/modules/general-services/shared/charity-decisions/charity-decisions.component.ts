import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { AdminLookupTypeEnum } from '@app/enums/admin-lookup-type-enum';
import { ListModelComponent } from '@app/generics/ListModel-component';
import { DateUtils } from '@app/helpers/date-utils';
import { ControlWrapper } from '@app/interfaces/i-control-wrapper';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { CharityDecision } from '@app/models/charity-decision';
import { AdminLookupService } from '@app/services/admin-lookup.service';
import { LangService } from '@app/services/lang.service';
import { DatepickerOptionsMap } from '@app/types/types';

@Component({
  selector: 'charity-decisions',
  templateUrl: './charity-decisions.component.html',
  styleUrls: ['./charity-decisions.component.scss'],
})
export class CharityDecisionsComponent extends ListModelComponent<CharityDecision> {
  get list() {
    return this._list;
  }
  @Input() set list(_list: CharityDecision[]) {
    this._list = _list;
  }
  @Input() readonly!: boolean;
  @Input() pageTitle!: keyof ILanguageKeys;
  @Input() inside = false;
  form!: UntypedFormGroup;
  datepickerOptionsMap: DatepickerOptionsMap = {
    generalDate: DateUtils.getDatepickerOptions({ disablePeriod: 'none' })
  };

  controls: ControlWrapper[] = [
    {
      controlName: 'referenceNumber',
      label: this.lang.map.project_reference_number,
      type: 'text',
    },
    {
      controlName: 'generalDate',
      label: this.lang.map.date,
      type: 'date',
    },
    {
      controlName: 'subject',
      label: this.lang.map.subject,
      type: 'text',
    },
    {
      controlName: 'category',
      label: this.lang.map.main_category,
      type: 'dropdown',
      dropdownValue: 'id',
      load$: this.inside
        ? this.adminLookupService.loadAsLookups(
          AdminLookupTypeEnum.PENALTIES_DECISION
        )
        : this.adminLookupService.loadAsLookups(
          AdminLookupTypeEnum.RESOLUTIONS_ISSUED
        ),
    },
  ];
  columns = ['referenceNumber', 'generalDate', 'subject', 'actions'];
  constructor(
    private adminLookupService: AdminLookupService,
    private fb: UntypedFormBuilder,
    public lang: LangService
  ) {
    super(CharityDecision);
  }

  protected _initComponent(): void {
    this.form = this.fb.group(this.model.buildForm());
  }
  _beforeAdd(model: CharityDecision): CharityDecision {
    model.generalDate = DateUtils.getDateStringFromDate(model.generalDate!)!;
    return model;
  }
  _selectOne(row: CharityDecision): void {
    this.form.patchValue({
      ...row,
      generalDate: DateUtils.changeDateToDatepicker(row.generalDate),
    });
  }
}
