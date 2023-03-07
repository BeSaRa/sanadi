import {Component, EventEmitter, forwardRef, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
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
import {UserClickOn} from "@enums/user-click-on.enum";
import {ImplementationTemplate} from "@models/implementation-template";
import {ReasonPopupComponent} from "@app/shared/popups/reason-popup/reason-popup.component";
import {ReasonContract} from "@contracts/reason-contract";

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
  @Input()
  caseId!: string
  @Input()
  requestType!: number

  @Output()
  amountConsumed: EventEmitter<boolean> = new EventEmitter<boolean>()

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

  private _currentTemplate?: string

  @Input()
  set currentTemplate(val: ImplementationTemplate[] | undefined) {
    this._currentTemplate = val && val.length ? val[0].templateId : undefined
  }

  inputMaskPatterns = CustomValidators.inputMaskPatterns
  @Input()
  projectTotalCost: number = 0

  fromGroup = new UntypedFormGroup({
    inputs: new UntypedFormArray([])
  })
  totalValue: number = 0;

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
        this.value = value ?? []
        this.listenToControls()
        this.calculateTotal()
        this.isFullAmountConsumed()
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
      .pipe(tap(_ => this.calculateTotal()))
      .pipe(filter(_ => this.value && !!this.value[index]))
      .subscribe((value) => {
        const model = this.value[index];
        const cValue = currency(value)
        const actualValue = cValue.value > model.remainingAmount ? model.remainingAmount : cValue.value
        model.totalCost = actualValue
        ctrl.patchValue(actualValue, {emitEvent: false})
        this.onChange(this.value)
        this.calculateTotal()
        this.isFullAmountConsumed()
        const template = this.getTemplatePermit()
        const currentPermit = this.value[index];
        template && currentPermit && currentPermit.remainingAmount === currentPermit.totalCost ? ctrl.disable() : ctrl.enable()
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

  takeRemaining(index: number) {
    const ctrl = this.inputs.at(index)
    const model = this.value[index];
    ctrl.setValue(model.remainingAmount)
  }

  noRemainingValue(i: number) {
    if (!this.value)
      return;

    const model = this.value[i]
    return model.remainingAmount === model.totalCost
  }

  addFundraisingLicense() {
    if (!this.criteria) return

    if (!this.projectTotalCost) {
      this.dialog.alert(this.lang.map.please_add_template_to_proceed)
      return
    }

    if (this.remainingAmount === 0) {
      this.dialog.info(this.lang.map.cannot_add_funding_resources_full_amount_have_been_used)
      return;
    }

    const criteria = this.service.getCriteria(this.criteria())
    this.service.loadFundraisingLicensesByCriteria(criteria, criteria.workArea!)
      .pipe(tap(models => !models.length && this.dialog.info(this.lang.map.no_result_for_your_search_criteria)))
      .pipe(filter(models => !!models.length))
      .pipe(switchMap(licenses => this.service.openSelectFundraisingDialog(licenses, this.caseId, this.requestType, this.value, this._currentTemplate).onAfterClose$))
      .pipe(filter((value: ImplementationFundraising): value is ImplementationFundraising => !!value))
      .subscribe((template: ImplementationFundraising) => {
        this.createInputWithListener(template.totalCost)
        this.value = this.value.concat(template)
        this.onChange(this.value);
        this.onTouch()
        this.calculateTotal()
        this.isFullAmountConsumed()
      })

  }

  deletePermit(item: ImplementationFundraising) {
    this.dialog
      .confirm(this.lang.map.msg_confirm_delete_x.change({x: this.lang.map.lang === 'ar' ? item.arabicName : item.englishName}))
      .onAfterClose$
      .pipe(filter((value): value is UserClickOn.YES => value === UserClickOn.YES))
      .subscribe(() => {
        this.value = this.value.filter(template => template.projectLicenseId !== item.projectLicenseId)
        this.onChange(this.value)
        this.calculateTotal()
        this.isFullAmountConsumed()
      })
  }

  calculateTotal(): void {
    this.totalValue = (this.value ?? []).reduce((acc, item) => acc + item.totalCost, 0)
  }

  isTemplatePermit(row: ImplementationFundraising) {
    return row.isMain
  }

  private getTemplatePermit(): ImplementationFundraising | undefined {
    return (this.value ?? []).find(item => item.isMain)
  }

  isFullAmountConsumed(): void {
    const template = this.getTemplatePermit()
    template ? this.amountConsumed.emit(template.totalCost === template.remainingAmount) : this.amountConsumed.emit(true)
  }


  openComment(row: ImplementationFundraising, index: number) {
    this.dialog
      .show<ReasonContract>(ReasonPopupComponent, {
        reasonLabel: this.lang.map.notes,
        required: false,
        saveBtn: this.lang.map.btn_save,
        title: row.projectLicenseFullSerial,
        reason: row.notes,
        view: this.disabled
      })
      .onAfterClose$
      .pipe(takeUntil(this.destroy$))
      .pipe(filter(({click}: { click: UserClickOn, comment: string }) => {
        return click === UserClickOn.YES
      }))
      .subscribe(({comment}) => {
        this.value[index].notes = comment;
        this.onChange(this.value)
      })
  }
}
