import {Component, forwardRef, Injector, OnDestroy, OnInit} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  NgControl,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup
} from "@angular/forms";
import {ImplementationFundraising} from "@models/implementation-fundraising";
import {Subject} from "rxjs";
import {LangService} from "@services/lang.service";
import {debounceTime, filter, map, takeUntil} from "rxjs/operators";
import currency from "currency.js";
import {CustomValidators} from "@app/validators/custom-validators";

@Component({
  selector: 'implementation-fundraising',
  templateUrl: './implementation-fundraising.component.html',
  styleUrls: ['./implementation-fundraising.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImplementationFundraisingComponent),
      multi: true
    }
  ]
})
export class ImplementationFundraisingComponent implements ControlValueAccessor, OnInit, OnDestroy {
  value: ImplementationFundraising[] = []
  disabled: boolean = false;
  control: FormControl | undefined
  private destroy$: Subject<any> = new Subject<any>()
  onChange!: (value: ImplementationFundraising[]) => void
  onTouch!: () => void
  destroyListeners$: Subject<any> = new Subject()
  displayedColumns: string[] = [
    'permitType',
    'projectLicenseFullSerial',
    'arName',
    'enName',
    'projectTotalCost',
    'consumedAmount',
    'remainingAmount',
    'totalCost'
  ];

  inputMaskPatterns = CustomValidators.inputMaskPatterns

  fromGroup = new UntypedFormGroup({
    inputs: new UntypedFormArray([])
  })

  constructor(private injector: Injector,
              public lang: LangService) {
  }

  get inputs(): UntypedFormArray {
    return this.fromGroup.get('inputs')! as UntypedFormArray
  }

  ngOnInit(): void {
    Promise.resolve().then(() => {
      const ctrl = this.injector.get(NgControl, undefined, {
        optional: true
      })
      this.control = ctrl?.control as FormControl || undefined
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.destroy$.unsubscribe()
    this.destroyListeners$.next()
    this.destroyListeners$.complete()
    this.destroyListeners$.unsubscribe()
  }

  private destroyOldListeners(): void {
    this.destroyListeners$.next()
  }

  writeValue(value: ImplementationFundraising[]): void {
    this.destroyOldListeners()
    this.createInputList(value)
    this.value = value
  }

  registerOnChange(fn: (value: ImplementationFundraising[]) => void): void {
    this.onChange = fn
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled
  }


  private listenToControl(ctrl: UntypedFormControl, index: number): void {
    ctrl.valueChanges
      .pipe(takeUntil((this.destroyListeners$)))
      .pipe(map(value => Number(value)))
      .pipe(filter(_ => !this.disabled))
      .pipe(debounceTime(250))
      .subscribe((value) => {
        const model = this.value[index];
        const cValue = currency(value)
        const actualValue = cValue.value > model.remainingAmount ? model.remainingAmount : cValue.value
        model.totalCost = actualValue
        ctrl.patchValue(actualValue, {emitEvent: false})
      })
  }

  private createInputList(list: ImplementationFundraising[] | undefined) {
    if (!list) return;

    list.forEach((item, index) => {
      const ctrl = new UntypedFormControl(item.totalCost)
      this.inputs.push(ctrl)
      this.listenToControl(ctrl, index)
    })

  }

  getRemaining(index: number) {
    const ctrl = this.inputs.at(index)
    const model = this.value[index];
    ctrl.setValue(model.remainingAmount)
  }

  noRemainingValue(i: number) {
    const model = this.value[i]
    return model.remainingAmount === model.totalCost
  }
}
