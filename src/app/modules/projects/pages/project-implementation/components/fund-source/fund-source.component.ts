import {Component, forwardRef, Input, OnDestroy, OnInit} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup
} from "@angular/forms";
import {FundingResourceContract} from "@contracts/funding-resource-contract";
import {FundSourceType} from "@app/enums/fund-source-type";
import {LangService} from "@services/lang.service";
import {ILanguageKeys} from "@contracts/i-language-keys";
import {Subject} from "rxjs";
import {DialogService} from "@services/dialog.service";
import {FundSourcePopupComponent} from "@modules/projects/popups/fund-source-popup/fund-source-popup.component";
import {OperationTypes} from "@app/enums/operation-types.enum";
import {FundSource} from "@models/fund-source";
import {filter, map, takeUntil} from "rxjs/operators";
import {CustomValidators} from "@app/validators/custom-validators";
import {UserClickOn} from "@app/enums/user-click-on.enum";

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
  remaining!: number;

  inputMask = CustomValidators.inputMaskPatterns

  form: UntypedFormGroup = new UntypedFormGroup({
    inputs: new UntypedFormArray([])
  })

  constructor(public lang: LangService, private dialog: DialogService) {

  }

  get inputs(): UntypedFormArray {
    return this.form.get('inputs')! as UntypedFormArray
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.destroy$.unsubscribe()
  }

  isGrant(): boolean {
    return this.type === FundSourceType.GRANT
  }

  ngOnInit(): void {
    this.label = this.type === FundSourceType.GRANT ? 'grant_financial' : 'self_financial'
    this.isGrant() && this.displayedColumns.unshift('fullName')
  }

  writeValue(value: FundingResourceContract[]): void {
    this.createInputs(value)
    this.createListeners()
    this.value = value
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
    // if (!this.projectTotalCost) {
    //   this.dialog.alert(this.lang.map.please_add_template_to_proceed)
    //   return
    // }

    this.dialog.show(FundSourcePopupComponent, {
      operation: OperationTypes.CREATE,
      model: new FundSource(),
      projectTotalCost: this.projectTotalCost,
      type: this.type
    })
      .onAfterClose$
      .pipe(takeUntil(this.destroy$))
      .pipe(filter((value): value is FundingResourceContract => !!value))
      .subscribe((source) => {
        this.createInputWithListener(source)
        this.value = this.value.concat(source)
        this.onChange(this.value)
        this.onTouch()
      })
  }

  editItem(row: FundingResourceContract, index: number): void {
    if (this.disabled) return;

    this.dialog.show(FundSourcePopupComponent, {
      operation: OperationTypes.UPDATE,
      model: row,
      projectTotalCost: this.projectTotalCost,
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
      })
  }

  createControl(totalCost: number): UntypedFormControl {
    return new UntypedFormControl(totalCost)
  }

  createListener(ctrl: UntypedFormControl) {
    ctrl
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .pipe(map((value) => Number(value)))
      .subscribe((value) => {
        console.log(value);
      })
  }

  private createInputs(value: FundingResourceContract[]) {
    value.forEach(item => {
      const ctrl = this.createControl(item.totalCost)
      this.inputs.push(ctrl)
    })
  }

  private createListeners(): void {
    (this.inputs.controls as UntypedFormControl[]).forEach(item => {
      this.createListener(item)
    })
  }

  private createInputWithListener(item: FundingResourceContract): void {
    const ctrl = this.createControl(item.totalCost)
    this.createListener(ctrl)
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
      })
  }
}
