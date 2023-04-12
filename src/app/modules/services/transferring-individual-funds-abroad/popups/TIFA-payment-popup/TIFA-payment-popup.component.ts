import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { DateUtils } from '@app/helpers/date-utils';
import { Payment } from '@app/models/payment';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { DatepickerControlsMap, DatepickerOptionsMap } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
  selector: 'app-TIFA-payment-popup',
  templateUrl: './TIFA-payment-popup.component.html',
  styleUrls: ['./TIFA-payment-popup.component.scss']
})
export class TIFAPaymentPopupComponent implements OnInit {

  form: UntypedFormGroup;
  readonly: boolean;
  editItem: number;
  model: Payment;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  datepickerControlsMap: DatepickerControlsMap = {};
  datepickerOptionsMap: DatepickerOptionsMap = {
    dueDate: DateUtils.getDatepickerOptions({ disablePeriod: 'past' })
  };
  constructor(@Inject(DIALOG_DATA_TOKEN)
  public data: {
    form: UntypedFormGroup,
    readonly: boolean,
    editItem: number,
    model: Payment,
  },
    public lang: LangService,
    private dialogRef: DialogRef) {
    this.form = data.form;
    this.readonly = data.readonly;
    this.editItem = data.editItem;
    this.model = data.model;
  }

  ngOnInit() {
    this._buildDatepickerControlsMap();
    const row = { ...this.model };
    row.dueDate = DateUtils.changeDateToDatepicker(row.dueDate);
    this.form.patchValue(row);
  }
  private _buildDatepickerControlsMap() {
    this.datepickerControlsMap = {
      dueDate: this.dueDate
    };
  }
  get dueDate(): UntypedFormControl {
    return this.form.get('dueDate')! as UntypedFormControl;
  }
  mapFormTo(form: any): Payment {
    const payment: Payment = new Payment().clone(form);
    payment.dueDate = DateUtils.getDateStringFromDate(payment.dueDate);

    return payment;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
  }
}
