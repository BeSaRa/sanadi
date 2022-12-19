import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ProjectFundraising} from "@app/models/project-fundraising";
import {OperationTypes} from "@app/enums/operation-types.enum";
import {ProjectFundraisingService} from "@services/project-fundraising.service";
import {BehaviorSubject, Subject} from "rxjs";
import {debounceTime, filter, map, startWith, takeUntil} from "rxjs/operators";
import {AbstractControl, FormGroup, UntypedFormArray, UntypedFormControl, UntypedFormGroup} from "@angular/forms";
import {LangService} from "@services/lang.service";
import {UserClickOn} from "@app/enums/user-click-on.enum";
import {DialogService} from "@services/dialog.service";
import {CustomValidators} from "@app/validators/custom-validators";
import {AmountOverYear} from "@app/models/amount-over-year";
import currency from "currency.js";
import {MaskPipe} from "ngx-mask";

@Component({
  selector: 'targeted-years-distribution',
  templateUrl: './targeted-years-distribution.component.html',
  styleUrls: ['./targeted-years-distribution.component.scss'],
  providers: [MaskPipe]
})
export class TargetedYearsDistributionComponent implements OnInit, OnDestroy {
  @Input()
  model!: ProjectFundraising
  @Input()
  operation!: OperationTypes
  @Input()
  readonly: boolean = false;

  private destroy$: Subject<any> = new Subject<any>();
  private destroyListener$: Subject<any> = new Subject<any>();
  private numberOfMonths$: BehaviorSubject<number | undefined> = new BehaviorSubject<number | undefined>(undefined);
  years: number = 0;

  item: UntypedFormControl = new UntypedFormControl();

  yearsList: string[] = [];
  maskPattern = CustomValidators.inputMaskPatterns;
  selectedItems: string[] = [];
  totalValue: number = 0;
  remain: number = 0;
  @Output()
  onAddItem: EventEmitter<void> = new EventEmitter<void>()
  @Output()
  onItemChange: EventEmitter<void> = new EventEmitter<void>()
  @Output()
  onItemRemoved: EventEmitter<void> = new EventEmitter<void>()

  @Input()
  set numberOfMonths(value: number) {
    this.numberOfMonths$.next(value);
  }

  public form: UntypedFormGroup = new FormGroup<any>({
    list: new UntypedFormArray([])
  })

  displayedColumns = ['year', 'amount'];

  deductionRatioChanges$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)

  @Input()
  set deductionRatioChanged(value: boolean) {
    this.deductionRatioChanges$.next(value)
  }

  get list(): UntypedFormArray {
    return this.form.get('list')! as UntypedFormArray
  }

  constructor(private service: ProjectFundraisingService,
              public lang: LangService,
              private maskPipe: MaskPipe,
              private dialog: DialogService) {
  }

  ngOnInit(): void {
    this.generateControlList()
    this.updateSelectedList()
    this.createListeners()
    this.listenToNumberOfMonthsChanges();
    if (this.operation === OperationTypes.CREATE) {
      this.displayedColumns = this.displayedColumns.concat(['actions'])
    }
    this.listenToDeductionRatioChanges()
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  private listenToNumberOfMonthsChanges() {
    this.numberOfMonths$
      .pipe(takeUntil(this.destroy$))
      .pipe(filter((val): val is number => !!val))
      .subscribe(() => {
        this.years = this.calculateYears();
        this.generateYearList(this.years);
      })
  }

  private calculateYears(): number {
    if (!this.numberOfMonths$.value) {
      return 0;
    }
    return Math.ceil(this.numberOfMonths$.value / 12);
  }

  private generateYearList(numberOfYears: number) {
    this.yearsList = Array.from({length: numberOfYears}, (_, i) => (i + 1).toString());
    this.updateSelectedList()
  }

  addItem(overrideAmount?: number): void {
    if (!this.item.value)
      return;

    if (!this.model.deductedPercentagesItemList.length) {
      this.dialog.error(this.lang.map.please_add_deduction_items_to_proceed)
      return;
    }
    const year = new AmountOverYear().clone({year: this.item.value, targetAmount: overrideAmount ? overrideAmount : 0});
    const control = this.createControl(year.year, year.targetAmount)

    this.listenToControl(control, this.list.length)
    this.list.push(control)
    this.model.addYear(year)
    this.updateSelectedList()
    this.item.setValue(null)
    this.onAddItem.emit()
  }

  itemExists(id: string): boolean {
    return this.selectedItems.includes(id);
  }

  removeItem(item: AmountOverYear, index: number) {
    this.dialog.confirm(this.lang.map.msg_confirm_delete_x.change({x: (item.year + this.lang.map.year_s)}))
      .onAfterClose$
      .pipe(filter((click: UserClickOn) => click === UserClickOn.YES))
      .subscribe(() => {
        this.model.removeYear(item)
        this.list.removeAt(index)
        this.updateSelectedList()
        this.calculateYears()
        this.onItemRemoved.emit()
      })
  }

  private createControl(year: number | string, amount: number): UntypedFormGroup {
    return new UntypedFormGroup({
      year: new UntypedFormControl(year.toString()),
      targetAmount: new UntypedFormControl(amount)
    })
  }

  private generateControlList(): void {
    this.model.amountOverYearsList.forEach((item) => {
      const control = this.createControl(item.year, item.targetAmount);
      this.list.push(control);
    })
  }

  private createListeners() {
    this.list.controls.forEach((control, index: number) => {
      ((i: number) => {
        this.listenToControl(control, i)
      })(index);
    })
  }

  private updateSelectedList(): void {
    this.selectedItems = this.model.amountOverYearsList.map(item => item.year);
    this.updateTotalValue()
  }

  private listenToControl(control: AbstractControl, index: number): void {
    const input = (control as UntypedFormGroup).controls.targetAmount;
    const year = (control as UntypedFormGroup).controls.year;
    const value = input.value;
    input.valueChanges
      .pipe(takeUntil(this.destroyListener$))
      .pipe(startWith(Number(value)))
      .pipe(debounceTime(400))
      .pipe(map(val => currency(val).value))
      .subscribe((value: number) => {
        const currentValue = currency(this.model.calculateAllYearsExcept(year.getRawValue())).add(value).value
        if (currentValue > this.model.targetAmount) {
          const toBeRemoved = currency(currentValue).subtract(this.model.targetAmount).value;
          const correctedValue = currency(value).subtract(toBeRemoved).value
          input.setValue(this.maskPipe.transform(correctedValue, this.maskPattern.SEPARATOR, this.maskPattern.THOUSAND_SEPARATOR), {emitEvent: false})
          !this.readonly && this.model.updateYear(correctedValue, index)
        } else {
          !this.readonly && this.model.updateYear(value, index)
        }
        this.updateTotalValue()
        this.onItemChange.emit()
      })
  }

  // noinspection JSUnusedLocalSymbols
  private makeYearsMatchInModel() {
    const years = this.yearsList.length;
    const amount = this.model.amountOverYearsList.length;
    years > amount ? this.addItemsToModel() : this.removeItemsFromModel();
  }

  private addItemsToModel() {
    const onlyOneYear = this.yearsList.length === 1;
    if (onlyOneYear) {
      this.addYearToModel(this.yearsList[0], this.model.targetAmount)
    } else {
      const existsList = this.model.amountOverYearsList.map(item => item.year);
      this.yearsList.forEach(item => {
        (!existsList.includes(item) ? this.addYearToModel(item, 0) : null)
      })
    }
  }

  private removeItemsFromModel() {
    this.model.removeYearsExcept(this.yearsList)
    const controlsNeedToBeRemoved = (this.list.controls as UntypedFormGroup[]).filter((item) => {
      return !this.yearsList.includes(item.controls.year.value)
    });
    controlsNeedToBeRemoved.forEach(ctrl => {
      this.removeControlFromList(ctrl)
    })

  }

  private removeControlFromList(item: AbstractControl): void {
    this.list.controls.forEach((ctrl, index) => {
      ctrl === item ? this.list.removeAt(index) : null
    })
  }

  private addYearToModel(year: string, amount: number): void {
    const amountOverYear = new AmountOverYear().clone({year: year, targetAmount: amount});
    const ctrl = this.createControl(amountOverYear.year, amount)
    this.listenToControl(ctrl, this.list.length)
    this.list.push(ctrl)
    this.model.addYear(amountOverYear)
  }

  private updateTotalValue(): void {
    this.totalValue = this.model.calculateAllYearsAmount()
    this.remain = currency(this.model.targetAmount).subtract(this.totalValue).value
  }

  distributeRemaining() {
    const length = this.model.amountOverYearsList.length
    if (length === 0)
      return;
    if (length === 1) {
      const input = (this.list.controls as UntypedFormGroup[])[0].controls.targetAmount;
      const value = input.getRawValue();
      input.setValue(currency(value).add(this.remain).value)
      return;
    }
    const mod = this.remain % length
    const dontDistribute = mod == this.remain
    if (dontDistribute) {
      return
    }
    const amountToDistribute = (this.remain - mod) / length;
    (this.list.controls as UntypedFormGroup[])
      .forEach((group) => {
        const currentValue = currency(group.controls.targetAmount.getRawValue()).value
        group.controls.targetAmount.setValue(currency(currentValue).add(amountToDistribute).value)
      })

  }

  takeTheRemaining(i: number) {
    if (this.remain != 0) {
      const input = (this.list.at(i) as UntypedFormGroup).controls.targetAmount
      input.setValue(currency(input.getRawValue()).add(this.remain).value)
    }
  }

  private addOrphanItem(): void {
    if (this.model.amountOverYearsList.length === 0 && this.yearsList.length === 1) {
      this.item.setValue(this.yearsList[0])
      this.addItem(this.model.targetAmount)
    }
  }

  private updateOrphanItem(): void {
    if (this.yearsList.length === 1 && this.model.amountOverYearsList.length === 1) {
      const input = (this.list.controls[0] as UntypedFormGroup).controls.targetAmount
      input.setValue(this.model.targetAmount)
    }
  }

  private listenToDeductionRatioChanges() {
    this.deductionRatioChanges$
      .pipe(takeUntil(this.destroy$))
      .pipe(filter(value => value))
      .subscribe(() => {
        this.addOrphanItem()
        this.updateOrphanItem()
      })
  }


  addAllItems(): void {
    if (!this.model.deductedPercentagesItemList.length) {
      this.dialog.error(this.lang.map.please_add_deduction_items_to_proceed)
      return;
    }

    if (this.yearsList.length === 1 && this.model.amountOverYearsList.length === 0) {
      this.addOrphanItem()
      return
    }

    this.yearsList.forEach(item => {
      if (!this.selectedItems.includes(item)) {
        this.item.setValue(item)
        this.addItem()
      }
    })
  }
}
