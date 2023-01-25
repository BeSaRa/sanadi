import {Component, forwardRef, Injector, Input, OnDestroy, OnInit} from '@angular/core';
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
import {debounceTime, filter, map, switchMap, takeUntil, tap} from "rxjs/operators";
import currency from "currency.js";
import {CustomValidators} from "@app/validators/custom-validators";
import {ImplementationCriteriaContract} from "@contracts/implementation-criteria-contract";
import {ProjectImplementationService} from "@services/project-implementation.service";
import {DialogService} from "@services/dialog.service";
import {UserClickOn} from "@app/enums/user-click-on.enum";

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
  @Input()
  criteria?: () => ImplementationCriteriaContract
  @Input()
  remainingAmount!: number

  displayedColumns: string[] = [
    'projectLicenseFullSerial',
    'permitType',
    'arName',
    'enName',
    'projectTotalCost',
    'consumedAmount',
    'remainingAmount',
    'totalCost',
    'actions'
  ];

  inputMaskPatterns = CustomValidators.inputMaskPatterns
  @Input()
  projectTotalCost: number = 0

  fromGroup = new UntypedFormGroup({
    inputs: new UntypedFormArray([])
  })

  constructor(private injector: Injector,
              private service: ProjectImplementationService,
              private dialog: DialogService,
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
    this.destroyListeners$.next(true)
  }

  writeValue(value: ImplementationFundraising[]): void {
    Promise.resolve()
      .then(() => {
        this.destroyOldListeners()
        this.value = []
        this.inputs.clear()
      })
      .then(() => {
        this.createInputList(value)
      })
      .then(() => {
        this.value = value
        this.listenToControls()
      })
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
      .pipe(map(value => Number(value)))
      .pipe(filter(_ => !this.disabled))
      .pipe(debounceTime(250))
      .pipe(takeUntil((this.destroy$)))
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

    list.forEach((item) => {
      const ctrl = this.createInput(item.totalCost)
      this.inputs.push(ctrl)
    });
  }

  private createInput(totalCost: number = 0): UntypedFormControl {
    return new UntypedFormControl(totalCost)
  }

  private createInputWithListener(totalCost: number = 0): void {
    const ctrl = this.createInput(totalCost)
    this.inputs.push(ctrl);
    this.listenToControl(ctrl, (this.inputs.length - 1))
  }


  listenToControls(): void {
    (this.inputs.controls as UntypedFormControl[]).forEach((ctrl, index) => {
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

  loadFundraising() {
    if (!this.criteria) return

    if (!this.projectTotalCost) {
      this.dialog.alert(this.lang.map.msg_please_select_x_to_continue.change({x: this.lang.map.lbl_template}))
      return;
    }

    const criteria = this.service.getCriteria(this.criteria())
    this.service.loadFundraisingLicensesByCriteria(criteria, criteria.workArea!)
      .pipe(tap(models => !models.length && this.dialog.info(this.lang.map.no_result_for_your_search_criteria)))
      .pipe(filter(models => !!models.length))
      .pipe(switchMap(licenses => this.service.openSelectFundraisingDialog(licenses, this.value).onAfterClose$))
      .pipe(filter((value: ImplementationFundraising): value is ImplementationFundraising => !!value))
      .subscribe((template: ImplementationFundraising) => {
        this.createInputWithListener(template.totalCost)
        this.value = this.value.concat(template)
        this.onChange(this.value);
        this.onTouch()
      })

  }

  deletePermit(item: ImplementationFundraising) {
    this.dialog
      .confirm(this.lang.map.msg_confirm_delete_x.change({x: this.lang.map.lang === 'ar' ? item.arName : item.enName}))
      .onAfterClose$
      .pipe(filter((value): value is UserClickOn.YES => value === UserClickOn.YES))
      .subscribe(() => {
        this.value = this.value.filter(template => template.projectLicenseId !== item.projectLicenseId)
        this.onChange(this.value)
      })
  }
}
