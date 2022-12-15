import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ProjectFundraising} from "@app/models/project-fundraising";
import {ProjectFundraisingService} from "@services/project-fundraising.service";
import {Country} from "@app/models/country";
import {OperationTypes} from "@app/enums/operation-types.enum";
import {BehaviorSubject, Subject} from "rxjs";
import {filter, takeUntil} from "rxjs/operators";
import {LangService} from "@services/lang.service";
import {UntypedFormControl} from "@angular/forms";
import {AmountOverCountry} from "@app/models/amount-over-country";
import {AdminResult} from "@app/models/admin-result";
import {DialogService} from "@services/dialog.service";
import {UserClickOn} from "@app/enums/user-click-on.enum";
import {CustomValidators} from "@app/validators/custom-validators";

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


    const country = this.item.value as Country
    const amount = (new AmountOverCountry()).clone({
      country: country.id,
      targetAmount: this.countriesChange$.value?.length === 1 ? this.model.targetAmount : 0,
      countryInfo: AdminResult.createInstance({
        ...country
      })
    })
    this.model.addCountry(amount)
    this.updateSelectedIds()
    this.item.setValue(null)
  }

  deleteCountry(row: AmountOverCountry) {
    this.dialog
      .confirm(this.lang.map.msg_confirm_delete_x.change({x: row.countryInfo.getName()}))
      .onAfterClose$
      .pipe(filter(val => val === UserClickOn.YES))
      .subscribe(() => {
        this.model.removeCountry(row.country)
        this.updateSelectedIds()
      })

  }

  private updateSelectedIds(): void {
    this.selectedIds = this.model.amountOverCountriesList.map(item => item.country)
  }

  amountChanged($event: KeyboardEvent, row: AmountOverCountry) {
    const input = $event.target as HTMLInputElement
    row.targetAmount = Number(input.value)
  }
}
