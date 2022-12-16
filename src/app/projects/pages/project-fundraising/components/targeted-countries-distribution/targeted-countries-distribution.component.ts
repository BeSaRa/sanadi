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

@Component({
  selector: 'targeted-countries-distribution',
  templateUrl: './targeted-countries-distribution.component.html',
  styleUrls: ['./targeted-countries-distribution.component.scss']
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

  @Input()
  set countriesChange(value: number[]) {
    this.countriesChange$.next(value)
  }


  constructor(private service: ProjectFundraisingService,
              private dialog: DialogService,
              public lang: LangService) {

  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.destroy$.unsubscribe()
  }

  ngOnInit(): void {
    if (this.operation === OperationTypes.CREATE) {
      this.displayedColumns.push('actions')
    }
    this.updateSelectedIds()
    this.listenToCountriesChanges()
  }

  get list(): UntypedFormArray {
    return this.items.get('items')! as UntypedFormArray
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
      .pipe(debounceTime(300))
      .pipe(map((value) => Number(value)))
      .pipe(takeUntil(this.destroy$))
      .subscribe((amount: number) => {
        const targetAmount = this.model.targetAmount;
        const amountChanged = amount + this.model.calculateAllCountriesExcept(countryId)
        const correctedAmount = currency(amountChanged).value > currency(targetAmount).value ? (currency(amount).subtract(currency(amountChanged).subtract(targetAmount).value)).value : amount
        if (currency(amountChanged).value > currency(targetAmount).value) {
          control.setValue(correctedAmount, {emitEvent: false})
        }
        this.model.updateCountryAmount(countryId, correctedAmount)
      })
  }

  private removeItem(country: AmountOverCountry, index: number): void {
    const id = country.country
    this.model.removeCountry(id);
    this.list.removeAt(index)
    this.updateSelectedIds()
  }
}
