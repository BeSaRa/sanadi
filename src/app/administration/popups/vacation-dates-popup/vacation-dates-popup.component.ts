import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { DateUtils } from '@app/helpers/date-utils';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { VacationDates } from '@app/models/vacation-dates';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { DatepickerControlsMap } from '@app/types/types';
import { IMyInputFieldChanged } from 'angular-mydatepicker';
import { Observable } from 'rxjs';

@Component({
  selector: 'vacation-dates-popup',
  templateUrl: './vacation-dates-popup.component.html',
  styleUrls: ['./vacation-dates-popup.component.scss']
})
export class VacationDatesPopupComponent extends AdminGenericDialog<VacationDates> {
  form!: FormGroup;
  model!: VacationDates;
  operation: OperationTypes;
  saveVisible = true;
  datepickerOptionsMap: IKeyValue = {
    vacationDateFrom: DateUtils.getDatepickerOptions({ disablePeriod: 'none' }),
    vacationDateTo: DateUtils.getDatepickerOptions({ disablePeriod: 'none' })
  };
  datepickerControlsMap: DatepickerControlsMap = {};
  constructor(public dialogRef: DialogRef,
    public fb: FormBuilder,
    public lang: LangService,
    @Inject(DIALOG_DATA_TOKEN) data: IDialogData<VacationDates>,
    private toast: ToastService,
  ) {
    super();
    this.model = (new VacationDates()).clone({ ...data.model });
    this.operation = data.operation;
  }

  initPopup(): void {
  }

  buildForm(): void {
    this.model.vacationDateFrom && (this.model.vacationDateFrom = DateUtils.changeDateToDatepicker(this.model.vacationDateFrom));
    this.model.vacationDateTo && (this.model.vacationDateTo = DateUtils.changeDateToDatepicker(this.model.vacationDateTo));

    this.form = this.fb.group(this.model.buildForm(true));
    if (this.operation === OperationTypes.VIEW) {
      this.form.disable();
      this.saveVisible = false;
      this.validateFieldsVisible = false;
    }

    this.datepickerControlsMap = {
      vacationDateFrom: this.form.get('vacationDateFrom')!,
      vacationDateTo: this.form.get('vacationDateTo')!
    };

  }

  beforeSave(model: VacationDates, form: FormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(model: VacationDates, form: FormGroup): Observable<VacationDates> | VacationDates {
    return (new VacationDates()).clone({ ...model, ...form.value });
  }

  onDateChange(event: IMyInputFieldChanged, fromFieldName: string, toFieldName: string) {
    DateUtils.setRelatedMinMaxDate({
      fromFieldName,
      toFieldName,
      controlOptionsMap: this.datepickerOptionsMap,
      controlsMap: this.datepickerControlsMap
    });
  }
  afterSave(model: VacationDates, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;

    this.operation === this.operationTypes.CREATE
      ? this.toast.success(message.change({ x: this.form.controls[this.lang.map.lang + 'Name'].value }))
      : this.toast.success(message.change({ x: model.getName() }));
    this.model = model;
    this.operation = OperationTypes.UPDATE;
    dialogRef.close(model);
  }

  saveFail(error: Error): void {
  }

  get popupTitle(): string {
    if (this.operation === OperationTypes.CREATE) {
      return this.lang.map.lbl_add_vacation;
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.lang.map.lbl_edit_vacation;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.lang.map.view;
    }
    return '';
  };

  destroyPopup(): void {
  }
}
