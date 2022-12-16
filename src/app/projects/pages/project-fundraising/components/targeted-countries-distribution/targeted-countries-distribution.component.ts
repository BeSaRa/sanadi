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

  @Input()
  set countriesChange(value: number[]) {
    this.countriesChange$.next(value)
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

  addItem(): void {
    if (!this.item.value)
      return
    const country = new AmountOverCountry().clone({
      country: this.item.value.id,
      targetAmount: 0,
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
      .pipe(debounceTime(500))
      .pipe(map((value) => currency(value).value))
      .pipe(takeUntil(this.destroy$))
      .pipe(takeUntil(this.destroyInputListeners$))
      .subscribe((amount: number) => {
        console.log(amount);
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
}
