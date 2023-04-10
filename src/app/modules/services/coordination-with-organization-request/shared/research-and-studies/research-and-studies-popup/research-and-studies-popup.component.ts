import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, UntypedFormArray, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { DateUtils } from '@app/helpers/date-utils';
import { ResearchAndStudies } from '@app/models/research-and-studies';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { DatepickerOptionsMap } from '@app/types/types';
import { IMyInputFieldChanged } from 'angular-mydatepicker';

@Component({
  selector: 'app-research-and-studies-popup',
  templateUrl: './research-and-studies-popup.component.html',
  styleUrls: ['./research-and-studies-popup.component.scss']
})
export class ResearchAndStudiesPopupComponent implements OnInit {
  form: UntypedFormGroup;
  editIndex: number;
  model: ResearchAndStudies;
  viewOnly: boolean;
  readonly: boolean;
  formArrayName: string;
  get formArray(): FormArray {
    return this.form.get(this.formArrayName) as FormArray;
  }
  datepickerOptionsMap: DatepickerOptionsMap = {
    searchStartDate: DateUtils.getDatepickerOptions({ disablePeriod: 'past' }),
    searchSubmissionDeadline: DateUtils.getDatepickerOptions({
      disablePeriod: 'past',
    }),
  };

  constructor(
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      form: UntypedFormGroup,
      editIndex: number,
      model: ResearchAndStudies,
      viewOnly: boolean,
      readonly: boolean,
      formArrayName: string,
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
  }
  ngOnInit() {
    const formArray = this.formArray;
    formArray.clear();
    if (this.model) {
      formArray.push(this.fb.group(new ResearchAndStudies().clone(this.model).BuildForm(true)));
      if (this.readonly || this.viewOnly) {
        this.formArray.disable();
      }
    }
  }

  get researchAndStudiesForm() {
    return this.form.controls.researchAndStudies as UntypedFormArray;
  }
  get researchAndStudiesFormArray() {
    return this.researchAndStudiesForm.controls['0'] as UntypedFormGroup;
  }
  get searchStartDate() {
    return this.researchAndStudiesFormArray.controls
      .searchStartDate as UntypedFormControl;
  }
  get searchSubmissionDeadline() {
    return this.researchAndStudiesFormArray.controls
      .searchSubmissionDeadline as UntypedFormControl;
  }
  onDateChange(
    event: IMyInputFieldChanged,
    fromFieldName: string,
    toFieldName: string
  ): void {
    DateUtils.setRelatedMinMaxDate({
      fromFieldName,
      toFieldName,
      controlOptionsMap: this.datepickerOptionsMap,
      controlsMap: {
        searchStartDate: this.searchStartDate,
        searchSubmissionDeadline: this.searchSubmissionDeadline,
      },
    });
  }
  mapForm(form: any): ResearchAndStudies {
    const entity: ResearchAndStudies = new ResearchAndStudies().clone(form);

    return entity;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(this.mapForm(this.form.getRawValue()));
  }

}
