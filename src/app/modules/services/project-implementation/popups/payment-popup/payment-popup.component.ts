import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {Subject} from "rxjs";
import {AbstractControl, UntypedFormBuilder, UntypedFormGroup} from "@angular/forms";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {IDialogData} from "@contracts/i-dialog-data";
import {Payment} from "@models/payment";
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {CustomValidators} from "@app/validators/custom-validators";
import {DateUtils} from "@helpers/date-utils";
import {IKeyValue} from "@contracts/i-key-value";
import {debounceTime, map, takeUntil} from "rxjs/operators";
import currency from "currency.js";


@Component({
  selector: 'payment-popup',
  templateUrl: './payment-popup.component.html',
  styleUrls: ['./payment-popup.component.scss']
})
export class PaymentPopupComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>()
  form!: UntypedFormGroup
  remainingAmount: number;
  projectTotalCost: number;
  model: Payment
  datepickerOptionsMap: IKeyValue = {
    dueDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
  };

  inputMaskPatterns = CustomValidators.inputMaskPatterns

  get dueDate(): AbstractControl {
    return this.form.get('dueDate')!
  }

  get totalCost(): AbstractControl {
    return this.form.get('totalCost')!
  }

  constructor(
    public lang: LangService,
    private dialogRef: DialogRef,
    private fb: UntypedFormBuilder,
    @Inject(DIALOG_DATA_TOKEN) private data: IDialogData<Payment> & { projectTotalCost: number, remainingAmount: number }
  ) {
    this.remainingAmount = this.data.remainingAmount
    this.projectTotalCost = this.data.projectTotalCost
    this.model = this.data.model
  }

  ngOnInit(): void {
    this.buildForm()
    this.listenToTotalCostChanges()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.destroy$.subscribe()
  }

  private buildForm() {
    this.form = this.fb.group({
      paymentNo: [this.model.paymentNo, [CustomValidators.required, CustomValidators.maxLength(300)]],
      dueDate: [DateUtils.changeDateToDatepicker(this.model.dueDate), CustomValidators.required],
      totalCost: [this.model.totalCost, CustomValidators.required],
      notes: [this.model.notes, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]
    })
  }

  savePayment() {
    const payment = new Payment().clone({
      ...this.form.getRawValue()
    })
    this.dialogRef.close(payment)
  }

  private listenToTotalCostChanges() {
    this.totalCost
      .valueChanges
      .pipe(debounceTime(300))
      .pipe(map(value => Number(value)))
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        const cValue = currency(value).value > this.remainingAmount ? this.remainingAmount : currency(value).value
        this.totalCost.setValue(cValue, {emitEvent: false})
      })
  }
}
