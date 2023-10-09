import { Component, EventEmitter, forwardRef, Injector, Input, OnDestroy, OnInit, Output } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  NgControl,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup
} from "@angular/forms";
import { ImplementationFundraising } from "@models/implementation-fundraising";
import { Subject } from "rxjs";
import { LangService } from "@services/lang.service";
import { debounceTime, filter, map, switchMap, takeUntil, tap } from "rxjs/operators";
import currency from "currency.js";
import { CustomValidators } from "@app/validators/custom-validators";
import { ImplementationCriteriaContract } from "@contracts/implementation-criteria-contract";
import { ProjectImplementationService } from "@services/project-implementation.service";
import { DialogService } from "@services/dialog.service";
import { UserClickOn } from "@enums/user-click-on.enum";
import { ImplementationTemplate } from "@models/implementation-template";
import { ReasonPopupComponent } from "@app/shared/popups/reason-popup/reason-popup.component";
import { ReasonContract } from "@contracts/reason-contract";
import { ProjectPermitTypes } from '@app/enums/project-permit-types';

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
  @Input()
  isOtherFundraisingSourcingHaveElements!: boolean

  @Output()
  amountConsumed: EventEmitter<boolean> = new EventEmitter<boolean>()
  addFundraisingLicense$: Subject<any> = new Subject<any>();
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
    this.listenToAdd()
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

  listenToAdd() {
    this.addFundraisingLicense$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.addFundraisingLicense())
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
      // .pipe(filter(_ => !this._isRequiredValueReached()))
      // .pipe(filter(_ => this.value[index].remainingAmount > this.value[index].totalCost))
      .pipe(debounceTime(250))
      .pipe(takeUntil((this.destroy$)))
      //.pipe(tap(_ => this.calculateTotal()))
      .pipe(filter(_ => this.value && !!this.value[index]))
      .pipe(map(value => {
        const model = this.value[index];
        //mean this is single project permit type
        if (model.isMain) {
          if (value > model.projectTotalCost) {
            value = model.remainingAmount
          }
        } else {
          if (model.remainingAmount < this.remainingAmount) {
            value = value > model.remainingAmount ? model.remainingAmount : value;
          }
          else {
            value =  value >  model.totalCost + this.remainingAmount ? model.totalCost + this.remainingAmount : value
          }
        }

        return value
      }))
      .subscribe((value) => {
        const model = this.value[index];
        const cValue = currency(value)
        const actualValue = cValue.value > model.remainingAmount ? model.remainingAmount : cValue.value;
        // const requiredValue = this.projectTotalCost - actualValue <= 0 ?
        //   this.projectTotalCost : this.projectTotalCost - actualValue;
        model.totalCost = actualValue >= this.projectTotalCost ? this.projectTotalCost : actualValue
        ctrl.patchValue(cValue, { emitEvent: false })
        this.onChange(this.value)
        this.calculateTotal()
        this.isFullAmountConsumed()
        // this._handleCtrlDisable(ctrl, index);
      })
  }

  private _handleCtrlDisable(ctrl: UntypedFormControl, index: number) {
    if (this._isRequiredValueReached()) {
      ctrl.disable();
      return;
    }
    const template = this.getTemplatePermit()
    const currentPermit = this.value[index];
    template && currentPermit && currentPermit.remainingAmount === currentPermit.totalCost ? ctrl.disable() : ctrl.enable()
  }
  private _isRequiredValueReached() {
    return this.totalValue >= this.projectTotalCost;
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
    const remainingAmount = model.remainingAmount >= model.projectTotalCost ?
      model.projectTotalCost :
      model.remainingAmount;
    ctrl.setValue(remainingAmount)
  }

  noRemainingValue(i: number) {
    if (!this.value)
      return;

    if (this._isRequiredValueReached()) return true;
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
    const index = this.value.findIndex(x => x.permitType === ProjectPermitTypes.SINGLE_TYPE_PROJECT);
    if (index !== -1) {
      if (this.inputs.controls[index].value < this.value[index].remainingAmount) {
        this.dialog.alert(this.lang.map.cannot_take_this_action_before_consume_full_permit_amount)
        return;
      }
    }

    const criteria = this.service.getCriteria(this.criteria())
    delete criteria.mainDAC;
    delete criteria.mainUNOCHA;
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
      .confirm(this.lang.map.msg_confirm_delete_x.change({ x: this.lang.map.lang === 'ar' ? item.arabicName : item.englishName }))
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
      .pipe(filter(({ click }: { click: UserClickOn, comment: string }) => {
        return click === UserClickOn.YES
      }))
      .subscribe(({ comment }) => {
        this.value[index].notes = comment;
        this.onChange(this.value)
      })
  }
  isItemDisabled(index :number){
    if(!this.value[index].isMain) return false;
    return this.value.length > 1 ||
    this.isOtherFundraisingSourcingHaveElements
  }
}
