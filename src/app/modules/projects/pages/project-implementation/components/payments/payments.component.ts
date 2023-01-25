import {Component, forwardRef, Input, OnDestroy, OnInit} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup
} from "@angular/forms";
import {Payment} from "@models/payment";
import {LangService} from "@services/lang.service";
import {CustomValidators} from "@app/validators/custom-validators";
import {DialogService} from "@services/dialog.service";
import {PaymentPopupComponent} from "@modules/projects/popups/payment-popup/payment-popup.component";
import {IDialogData} from "@contracts/i-dialog-data";
import {OperationTypes} from "@app/enums/operation-types.enum";
import {debounceTime, filter, map, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {UserClickOn} from "@app/enums/user-click-on.enum";
import currency from "currency.js";

@Component({
  selector: 'payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PaymentsComponent),
      multi: true
    }
  ]
})
export class PaymentsComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input()
  disabled: boolean = false;
  @Input()
  projectTotalCost!: number
  @Input()
  remainingAmount!: number
  destroy$ = new Subject<void>()

  value: Payment[] = []
  onChange!: (value: Payment[]) => void
  onTouch!: () => void
  displayedColumns: string[] = ['paymentNo', 'notes', 'dueDate', 'totalCost', 'actions'];
  form: UntypedFormGroup = new UntypedFormGroup({
    inputs: new UntypedFormArray([])
  })
  inputMask = CustomValidators.inputMaskPatterns;


  constructor(public lang: LangService, private dialog: DialogService) {
  }

  get inputs(): UntypedFormArray {
    return this.form.get('inputs')! as UntypedFormArray
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.destroy$.subscribe()
  }

  ngOnInit(): void {

  }

  writeValue(value: Payment[]): void {
    this.value = []
    this.createInputs(value)
    this.createListeners()
    this.value = value;
  }

  registerOnChange(fn: (value: Payment[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled
  }

  openAddPaymentDialog() {
    this.dialog.show<IDialogData<Payment>>(PaymentPopupComponent, {
      model: new Payment(),
      operation: OperationTypes.CREATE,
      projectTotalCost: this.projectTotalCost,
      remainingAmount: this.remainingAmount
    }).onAfterClose$
      .pipe(takeUntil(this.destroy$))
      .pipe(filter((value: Payment): value is Payment => !!value))
      .subscribe((payment) => {
        this.createControlWithListener(payment)
        this.value = this.value.concat(payment)
        this.onChange(this.value)
        this.onTouch()
      })
  }

  deleteItem(payment: Payment, index: number) {
    this.dialog
      .confirm(this.lang.map.msg_confirm_delete_selected)
      .onAfterClose$
      .pipe(takeUntil(this.destroy$))
      .pipe(filter((value): value is UserClickOn.YES => value === UserClickOn.YES))
      .subscribe(() => {
        this.value = this.value.filter(item => item !== payment)
        this.inputs.removeAt(index);
        this.onChange(this.value)
        this.onTouch()
      })

  }

  editItem(item: Payment, index: number) {
    this.dialog.show<IDialogData<Payment>>(PaymentPopupComponent, {
      model: item,
      operation: OperationTypes.UPDATE,
      projectTotalCost: this.projectTotalCost,
      remainingAmount: this.remainingAmount
    }).onAfterClose$
      .pipe(takeUntil(this.destroy$))
      .pipe(filter((value: Payment): value is Payment => !!value))
      .subscribe((payment) => {
        this.inputs.at(index).setValue(payment.totalCost, {emitEvent: false})
        this.value = this.value.map((item, i) => {
          return i === index ? new Payment().clone(payment) : item
        })
        this.onChange(this.value)
        this.onTouch()
      })
  }

  createInput(totalCost: number): UntypedFormControl {
    return new UntypedFormControl(totalCost)
  }

  createListener(ctrl: UntypedFormControl) {
    ctrl
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .pipe(debounceTime(250))
      .pipe(map(value => Number(value)))
      .subscribe((value) => {
        const cValue = currency(value).value > this.remainingAmount ? this.remainingAmount : currency(value).value
        ctrl.setValue(cValue, {emitEvent: false})
      })
  }

  createInputs(values: Payment[]): void {
    this.inputs.clear()
    values.forEach(item => {
      const ctrl = this.createInput(item.totalCost)
      this.inputs.push(ctrl)
    })
  }

  createListeners(): void {
    (this.inputs.controls as UntypedFormControl[]).forEach(ctrl => {
      this.createListener(ctrl)
    })
  }

  createControlWithListener(payment: Payment): void {
    const ctrl = this.createInput(payment.totalCost)
    this.createListener(ctrl)
    this.inputs.push(ctrl)
  }
}
