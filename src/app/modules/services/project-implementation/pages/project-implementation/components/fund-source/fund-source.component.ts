import {Component, forwardRef, Input, OnDestroy, OnInit} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup
} from "@angular/forms";
import {FundingResourceContract} from "@contracts/funding-resource-contract";
import {FundSourceType} from "@enums/fund-source-type";
import {LangService} from "@services/lang.service";
import {ILanguageKeys} from "@contracts/i-language-keys";
import {Subject} from "rxjs";
import {DialogService} from "@services/dialog.service";
import {FundSourcePopupComponent} from "@modules/services/project-implementation/popups/fund-source-popup/fund-source-popup.component";
import {OperationTypes} from "@enums/operation-types.enum";
import {FundSource} from "@models/fund-source";
import {debounceTime, filter, map, takeUntil} from "rxjs/operators";
import {CustomValidators} from "@app/validators/custom-validators";
import {UserClickOn} from "@enums/user-click-on.enum";
import currency from "currency.js";

@Component({
  selector: 'fund-source',
  templateUrl: './fund-source.component.html',
  styleUrls: ['./fund-source.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FundSourceComponent),
      multi: true
    }
  ]
})
export class FundSourceComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input()
  disabled: boolean = false
  @Input()
  type: FundSourceType = FundSourceType.GRANT;
  value: FundingResourceContract[] = [];
  onChange!: (_value: FundingResourceContract[]) => void
  onTouch!: () => void
  displayedColumns: string[] = ['notes', 'totalCost', 'actions'];
  label!: keyof Pick<ILanguageKeys, 'grant_financial' | 'self_financial'>;
  private destroy$: Subject<void> = new Subject<void>()
  @Input()
  projectTotalCost!: number;
  @Input()
  remainingAmount!: number
  @Input()
  permitAmountConsumed!: boolean

  inputMask = CustomValidators.inputMaskPatterns

  form: UntypedFormGroup = new UntypedFormGroup({
    inputs: new UntypedFormArray([])
  })

  totalValue: number = 0;

  listeners$ = new Subject()

  constructor(public lang: LangService, private dialog: DialogService) {

  }

  get inputs(): UntypedFormArray {
    return this.form.get('inputs')! as UntypedFormArray
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.destroy$.unsubscribe()
    this.listeners$.next()
    this.listeners$.complete()
    this.listeners$.unsubscribe()
  }

  isGrant(): boolean {
    return this.type === FundSourceType.GRANT
  }

  ngOnInit(): void {
    this.label = this.type === FundSourceType.GRANT ? 'grant_financial' : 'self_financial'
    this.isGrant() && this.displayedColumns.unshift('fullName')
  }

  destroyOldListeners(): void {
    this.listeners$.next()
  }

  writeValue(value: FundingResourceContract[]): void {
    Promise.resolve()
      .then(() => {
        this.destroyOldListeners()
        this.value = []
        this.inputs.clear()
      })
      .then(() => {
        this.createInputs(value)
      })
      .then(() => {
        this.value = value ?? []
        this.createListeners()
        this.calculateTotal()
      })
  }

  registerOnChange(fn: (_value: FundingResourceContract[]) => void): void {
    this.onChange = fn
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled
  }

  openAddFundSourceDialog(): void {
    if (!this.projectTotalCost) {
      this.dialog.alert(this.lang.map.please_add_template_to_proceed)
      return
    }

    if (!this.permitAmountConsumed) {
      this.dialog.alert(this.lang.map.cannot_take_this_action_before_consume_full_permit_amount)
      return;
    }

    if (this.remainingAmount === 0) {
      this.dialog.info(this.lang.map.cannot_add_funding_resources_full_amount_have_been_used)
      return;
    }

    this.dialog.show(FundSourcePopupComponent, {
      operation: OperationTypes.CREATE,
      model: new FundSource(),
      projectTotalCost: this.projectTotalCost,
      type: this.type,
      remainingAmount: this.remainingAmount
    })
      .onAfterClose$
      .pipe(takeUntil(this.destroy$))
      .pipe(filter((value): value is FundingResourceContract => !!value))
      .subscribe((source) => {
        this.createInputWithListener(source)
        this.value = this.value.concat(source)
        this.onChange(this.value)
        this.onTouch()
        this.calculateTotal()
      })
  }

  editItem(row: FundingResourceContract, index: number): void {
    if (this.disabled) return;

    this.dialog.show(FundSourcePopupComponent, {
      operation: OperationTypes.UPDATE,
      model: row,
      projectTotalCost: this.projectTotalCost,
      remainingAmount: this.getRemaining(index),
      type: this.type
    })
      .onAfterClose$
      .pipe(takeUntil(this.destroy$))
      .pipe(filter((value): value is FundingResourceContract => !!value))
      .subscribe((value) => {
        this.inputs.at(index).setValue(value.totalCost, {emitEvent: false})
        this.value = this.value.map((item, i) => {
          return i === index ? new FundSource().clone(value) : item
        })
        this.onChange(this.value)
        this.onTouch()
        this.calculateTotal()
      })
  }

  createControl(totalCost: number): UntypedFormControl {
    return new UntypedFormControl(totalCost)
  }

  createListener(ctrl: UntypedFormControl, index: number) {
    ctrl
      .valueChanges
      .pipe(takeUntil(this.listeners$))
      .pipe(debounceTime(250))
      .pipe(map((value) => Number(value)))
      .subscribe((value) => {
        const remaining = this.getRemaining(index)
        const cValue = value > remaining ? remaining : value
        this.value[index].totalCost = cValue;
        ctrl.setValue(cValue, {emitEvent: false})
        this.onChange(this.value)
        this.onTouch()
        this.calculateTotal()
      })
  }

  private createInputs(value: FundingResourceContract[]) {
    (value ?? []).forEach(item => {
      const ctrl = this.createControl(item.totalCost)
      this.inputs.push(ctrl)
    })
  }

  private createListeners(): void {
    (this.inputs.controls as UntypedFormControl[]).forEach((item, index) => {
      this.createListener(item, index)
    })
  }

  private createInputWithListener(item: FundingResourceContract): void {
    const ctrl = this.createControl(item.totalCost)
    this.createListener(ctrl, this.inputs.length)
    this.inputs.push(ctrl)
  }

  deleteItem(row: FundingResourceContract, i: number) {
    this.dialog
      .confirm(this.lang.map.msg_confirm_delete_selected)
      .onAfterClose$
      .pipe(takeUntil(this.destroy$))
      .pipe(filter((value): value is UserClickOn.YES => value === UserClickOn.YES))
      .subscribe(() => {
        this.value = this.value.filter(item => item !== row)
        this.inputs.removeAt(i);
        this.onChange(this.value)
        this.onTouch()
        this.calculateTotal()
      })
  }

  getRemaining(index: number): number {
    return currency(this.remainingAmount).add((this.value[index] && this.value[index].totalCost || 0)).value
  }

  calculateTotal(): void {
    this.totalValue = (this.value ?? []).reduce((acc, item) => acc + item.totalCost, 0)
  }

  distributeRemaining() {
    const length = this.value.length
    if (!length) return

    const mod = this.remainingAmount % length

    if (mod === this.remainingAmount) return;

    const amount = currency(this.remainingAmount).subtract(mod).value  / length
    this.inputs.controls.forEach((item, index) => {
      const oldValue = item.getRawValue()
      const value = currency(amount).add(oldValue).value
      item.setValue(value, {emitEvent: false})
      this.value[index].totalCost = value
    })
    this.onChange(this.value)
  }

  takeRemaining(index: number): void {
    const value = currency(this.value[index].totalCost).add(this.remainingAmount).value
    this.inputs.at(index).setValue(value, {emitEvent: false})
    this.value[index].totalCost = value;
    this.onChange(this.value)
  }
}
