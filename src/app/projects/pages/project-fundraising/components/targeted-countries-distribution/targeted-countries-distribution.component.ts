import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ProjectFundraising} from "@app/models/project-fundraising";
import {ProjectFundraisingService} from "@services/project-fundraising.service";
import {Country} from "@app/models/country";
import {OperationTypes} from "@app/enums/operation-types.enum";
import {BehaviorSubject, Subject} from "rxjs";
import {debounceTime, filter, map, takeUntil} from "rxjs/operators";
import {LangService} from "@services/lang.service";
import {UntypedFormArray, UntypedFormControl, UntypedFormGroup} from "@angular/forms";
import {AmountOverCountry} from "@app/models/amount-over-country";
import {AdminResult} from "@app/models/admin-result";
import {DialogService} from "@services/dialog.service";
import {UserClickOn} from "@app/enums/user-click-on.enum";
import {CustomValidators} from "@app/validators/custom-validators";
import currency from "currency.js";
import {MaskPipe} from "ngx-mask";

@Component({
  selector: 'targeted-countries-distribution',
  templateUrl: './targeted-countries-distribution.component.html',
  styleUrls: ['./targeted-countries-distribution.component.scss'],
  providers: [MaskPipe]
})
export class TargetedCountriesDistributionComponent implements OnInit, OnDestroy {
  @Input()
  model!: ProjectFundraising
  @Input()
  countries: Country[] = []
  @Input()
  operation!: OperationTypes
  @Input()
  readonly: boolean = false;

  countriesList: Country[] = []

  item: UntypedFormControl = new UntypedFormControl()

  private destroy$: Subject<any> = new Subject<any>()

  private countriesChange$: BehaviorSubject<number[] | undefined> = new BehaviorSubject<number[] | undefined>(undefined)

  displayedColumns: string[] = ['arName', 'enName', 'amount'];

  selectedIds: number[] = [];

  maskPattern = CustomValidators.inputMaskPatterns;

  items = new UntypedFormGroup({
    items: new UntypedFormArray([])
  })

  private destroyInputListeners$: Subject<any> = new Subject<any>();
  totalValue: number = 0;
  remain: number = 0;

  deductionRatioChanges$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)

  @Input()
  set countriesChange(value: number[]) {
    this.countriesChange$.next(value)
  }

  @Input()
  set deductionRatioChanged(value: boolean) {
    this.deductionRatioChanges$.next(value)
  }


  constructor(private service: ProjectFundraisingService,
              private dialog: DialogService,
              private maskPipe: MaskPipe,
              public lang: LangService) {

  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.destroy$.unsubscribe()

    this.destroyInputListeners$.next()
    this.destroyInputListeners$.complete()
    this.destroyInputListeners$.unsubscribe()
  }


  ngOnInit(): void {
    if (this.operation === OperationTypes.CREATE) {
      this.displayedColumns.push('actions')
    }
    this.updateSelectedIds()
    this.generateInputsControllers()
    this.listenToControllers()
    this.listenToCountriesChanges()
    this.listenToDeductionRatioChanges()
  }

  get list(): UntypedFormArray {
    return this.items.get('items')! as UntypedFormArray
  }

  private listenToControllers(): void {
    this.list.controls.forEach((group) => {
      this.listenToControl(group as UntypedFormGroup)
    })
  }

  private listenToCountriesChanges() {
    this.countriesChange$
      .pipe(takeUntil(this.destroy$))
      .pipe(filter((val): val is number[] => !!val))
      .subscribe(() => {
        this.generateCountryList()
      })
  }

  private generateCountryList(): void {
    this.countriesList = this.countries.filter(country => this.countriesChange$.value?.includes(country.id))
  }

  itemExists(id: number): boolean {
    return this.selectedIds.includes(id)
  }

  addItem(overrideAmount?: number): void {
    if (!this.item.value)
      return
    const country = new AmountOverCountry().clone({
      country: this.item.value.id,
      targetAmount: overrideAmount ? overrideAmount : 0,
      countryInfo: AdminResult.createInstance(this.item.value)
    })
    const control = this.createControl(country.country, country.targetAmount)
    this.listenToControl(control)
    this.list.push(control)
    this.model.addCountry(country)
    this.updateSelectedIds()
    this.item.setValue(null)
  }

  deleteCountry(row: AmountOverCountry, index: number) {
    this.dialog
      .confirm(this.lang.map.msg_confirm_delete_x.change({x: row.countryInfo.getName()}))
      .onAfterClose$
      .pipe(filter(val => val === UserClickOn.YES))
      .subscribe(() => {
        this.removeItem(row, index)
      })
  }

  private updateSelectedIds(): void {
    this.selectedIds = this.model.amountOverCountriesList.map(item => item.country)
    this.updateTotalValue()
  }

  createControl(country: number, targetAmount: number): UntypedFormGroup {
    return new UntypedFormGroup({
      country: new UntypedFormControl(country),
      targetAmount: new UntypedFormControl(targetAmount)
    })
  }

  listenToControl(group: UntypedFormGroup): void {
    const control = group.controls.targetAmount;
    const countryId = group.controls.country.value as number;
    control.valueChanges
      .pipe(filter((value): value is number => value !== null))
      .pipe(debounceTime(400))
      .pipe(map((value) => currency(value).value))
      .pipe(takeUntil(this.destroy$))
      .pipe(takeUntil(this.destroyInputListeners$))
      .subscribe((amount: number) => {
        const targetAmount = this.model.targetAmount;
        const amountChanged = amount + this.model.calculateAllCountriesExcept(countryId)
        const correctedAmount = currency(amountChanged).value > currency(targetAmount).value ? (currency(amount).subtract(currency(amountChanged).subtract(targetAmount).value)).value : amount
        if (currency(amountChanged).value > currency(targetAmount).value) {
          control.setValue(this.maskPipe.transform(correctedAmount, this.maskPattern.SEPARATOR, this.maskPattern.THOUSAND_SEPARATOR), {emitEvent: false})
        }
        this.model.updateCountryAmount(countryId, correctedAmount)
        this.updateTotalValue()
      })
  }

  private removeItem(country: AmountOverCountry, index: number): void {
    const id = country.country
    this.model.removeCountry(id);
    this.list.removeAt(index)
    this.updateSelectedIds()
  }

  private generateInputsControllers() {
    this.model.amountOverCountriesList.forEach(amount => {
      this.list.push(this.createControl(amount.country, amount.targetAmount))
    })
  }

  private updateTotalValue(): void {
    this.totalValue = this.model.calculateAllCountriesAmount()
    this.remain = currency(this.model.targetAmount).subtract(this.totalValue).value
  }

  addAllItems(): void {
    if (this.countriesList.length === 1 && this.model.amountOverCountriesList.length === 0) {
      this.addOrphanItem()
      return
    }
    this.countriesList.forEach(item => {
      if (!this.selectedIds.includes(item.id)) {
        this.item.setValue(item)
        this.addItem()
      }
    })
  }

  distributeRemaining() {
    const length = this.model.amountOverCountriesList.length
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
    if (this.model.amountOverCountriesList.length === 0 && this.countriesList.length === 1) {
      this.item.setValue(this.countriesList[0])
      this.addItem(this.model.targetAmount)
    }
  }

  private updateOrphanItem(): void {
    if (this.countriesList.length === 1 && this.model.amountOverCountriesList.length === 1) {
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
}
