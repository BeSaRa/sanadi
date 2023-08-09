import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { EffectiveCoordinationCapabilities } from '@app/models/effective-coordination-capabilities';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Profile } from '@app/models/profile';
import { Lookup } from '@app/models/lookup';
import { DateUtils } from '@app/helpers/date-utils';
import { DatepickerOptionsMap } from '@app/types/types';
import { IMyInputFieldChanged } from 'angular-mydatepicker';

@Component({
  selector: 'app-effective-coordination-capabilities-popup',
  templateUrl: './effective-coordination-capabilities-popup.component.html',
  styleUrls: ['./effective-coordination-capabilities-popup.component.scss']
})
export class EffectiveCoordinationCapabilitiesPopupComponent implements OnInit {
  form: UntypedFormGroup;
  editIndex: number;
  model: EffectiveCoordinationCapabilities;
  viewOnly: boolean;
  readonly: boolean;
  formArrayName: string;
  organizationWays: Lookup[];
  organizationUnits: Profile[];
  datepickerOptionsMap: DatepickerOptionsMap = {
    eventStartDate: DateUtils.getDatepickerOptions({disablePeriod: 'past'}),
  };
  get formArray(): FormArray {
    return this.form.get(this.formArrayName) as FormArray;
  }
  constructor(
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      form: UntypedFormGroup,
      editIndex: number,
      model: EffectiveCoordinationCapabilities,
      viewOnly: boolean,
      readonly: boolean,
      formArrayName: string,
      organizationWays: Lookup[],
      organizationUnits: Profile[]
    },
    public lang: LangService,
    private fb: FormBuilder,
    private dialogRef: DialogRef,
  ) {
    this.form = data.form;
    this.editIndex = data.editIndex;
    this.model = data.model;
    this.viewOnly = data.viewOnly;
    this.readonly = data.readonly;
    this.formArrayName = data.formArrayName;
    this.organizationWays = data.organizationWays;
    this.organizationUnits = data.organizationUnits;
  }
  ngOnInit() {
    const formArray = this.formArray;
    formArray.clear();
    if (this.model) {

      formArray.push(this.fb.group(new EffectiveCoordinationCapabilities().clone(this.model).BuildForm(true)));
      if (this.readonly || this.viewOnly) {
        this.formArray.disable();
      }
      DateUtils.enablePastSelectedDates(this.datepickerOptionsMap, this.model);
    }
  }
  onDateChange(event: IMyInputFieldChanged, fromFieldName: string, toFieldName: string): void {
    DateUtils.setRelatedMinMaxDate({
      fromFieldName,
      toFieldName,
      controlOptionsMap: this.datepickerOptionsMap,
      controlsMap: {
        searchStartDate: this.searchStartDate,
        searchSubmissionDeadline: this.searchSubmissionDeadline
      }
    });
  }

  get searchStartDate() {
    return this.form.controls.searchStartDate as UntypedFormControl;
  }

  get searchSubmissionDeadline() {
    return this.form.controls.searchSubmissionDeadline as UntypedFormControl;
  }
  mapForm(form: any): EffectiveCoordinationCapabilities {
    const entity: EffectiveCoordinationCapabilities = new EffectiveCoordinationCapabilities().clone(form);

    return entity;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(this.mapForm(this.form.getRawValue()));
  }

}
