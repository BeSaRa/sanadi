import {Component, forwardRef, Input, OnDestroy, OnInit} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup
} from "@angular/forms";
import {Payment} from "@models/payment";
import {LangService} from "@services/lang.service";
import {CustomValidators} from "@app/validators/custom-validators";
import {DialogService} from "@services/dialog.service";
import {PaymentPopupComponent} from "@modules/services/project-implementation/popups/payment-popup/payment-popup.component";
import {IDialogData} from "@contracts/i-dialog-data";
import {OperationTypes} from "@enums/operation-types.enum";
import {debounceTime, filter, map, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {UserClickOn} from "@enums/user-click-on.enum";
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
  private _projectTotalCost!: number
  @Input()
  set projectTotalCost(val: number) {
    this._projectTotalCost = val || 0
    this.calculateRemaining()
  }
  get projectTotalCost(): number {
    return this._projectTotalCost
  }
  
  private _projectCollectedValue!: number
  @Input()
  set projectCollectedValue(val: number) {
    this._projectCollectedValue = val || 0
    this.calculateRemaining()
  }
  get projectCollectedValue(): number {
    return this._projectCollectedValue
  }

  remainingAmount!: number;

  destroy$ = new Subject<void>()
  addPaymentDialog$ : Subject<any> = new Subject<any>();
  value: Payment[] = []
  onChange!: (value: Payment[]) => void
  onTouch!: () => void
  displayedColumns: string[] = ['paymentNo', 'notes', 'dueDate', 'totalCost', 'actions'];
  form: UntypedFormGroup = new UntypedFormGroup({
    inputs: new UntypedFormArray([])
  })
  inputMask = CustomValidators.inputMaskPatterns;
  totalValue = 0

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
    this.listenToAdd()
  }

  listenToAdd(){
    this.addPaymentDialog$
    .pipe(takeUntil(this.destroy$))
    .subscribe(()=>this.openAddPaymentDialog())
  }
  
  writeValue(value: Payment[]): void {
    this.value = []
    this.createInputs(value)
    this.createListeners()
    this.value = value ?? [];
    this.calculateRemaining()
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
    if (!this.projectTotalCost) {
      this.dialog.alert(this.lang.map.please_add_template_to_proceed)
      return
    }

    if (!this.remainingAmount) {
      this.dialog.info(this.lang.map.cannot_add_payments_full_amount_have_been_used)
      return;
    }

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
        this.calculateRemaining()
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
        this.calculateRemaining()
      })
  }

  editItem(item: Payment, index: number) {
    this.dialog.show<IDialogData<Payment>>(PaymentPopupComponent, {
      model: item,
      operation: OperationTypes.UPDATE,
      projectTotalCost: this.projectTotalCost,
      remainingAmount: this.calculateAllExcept(index)
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
        this.calculateRemaining()
      })
  }

  createInput(totalCost: number): UntypedFormControl {
    return new UntypedFormControl(totalCost)
  }

  createListener(ctrl: UntypedFormControl, index: number) {
    ctrl
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .pipe(debounceTime(250))
      .pipe(map(value => Number(value)))
      .subscribe((value) => {
        const remaining = this.calculateAllExcept(index)
        const cValue = currency(value).value > currency(remaining).value ?  currency(value).value: currency(remaining).value
        ctrl.setValue(cValue, {emitEvent: false})
        this.value[index].totalCost = cValue
        this.onChange(this.value)
        this.calculateRemaining()
      })
  }

  createInputs(values: Payment[]): void {
    this.inputs.clear();
    (values ?? []).forEach(item => {
      const ctrl = this.createInput(item.totalCost)
      this.inputs.push(ctrl)
    })
  }

  createListeners(): void {
    (this.inputs.controls as UntypedFormControl[]).forEach((ctrl, index) => {
      this.createListener(ctrl, index)
    })
  }

  createControlWithListener(payment: Payment): void {
    const ctrl = this.createInput(payment.totalCost)
    this.createListener(ctrl, this.inputs.length)
    this.inputs.push(ctrl)
  }

  calculateRemaining(): void {
    this.remainingAmount = currency(this.projectCollectedValue).subtract((this.value ?? []).reduce((acc, item) => {
      return acc + item.totalCost
    }, 0)).value
    this.calculateTotal()
  }

  calculateTotal(): void {
    this.totalValue = (this.value ?? []).reduce((acc, item) => acc + item.totalCost, 0)
  }

  calculateAllExcept(index: number): number {
    return currency(this.projectCollectedValue)
    .subtract((this.inputs.controls as FormControl<number>[])
    .reduce((acc, item, currentIndex) => {
      return this.inputs.controls.length === 1 ? 
        acc + Number(item.getRawValue())
      : acc + (index === currentIndex ? 0 : Number(item.getRawValue()))
    }, 0)).value
  }

  distributeRemaining() {
    const length = this.value.length
    if (!length) return

    const mod = this.remainingAmount % length

    if (mod === this.remainingAmount) return;


    const amount = currency(this.remainingAmount).subtract(mod).value / length
    this.inputs.controls.forEach((item, index) => {
      const oldValue = item.getRawValue()
      const value = currency(amount).add(oldValue).value
      item.setValue(value, {emitEvent: false})
      this.value[index].totalCost = value
    })
    this.onChange(this.value)
    this.calculateRemaining()
  }
  takeRemaining(index: number): void {
    const value = currency(this.value[index].totalCost).add(this.remainingAmount).value
    this.inputs.at(index).setValue(value, {emitEvent: false})
    this.value[index].totalCost = value;
    this.onChange(this.value)
    this.calculateRemaining()
  }
}
