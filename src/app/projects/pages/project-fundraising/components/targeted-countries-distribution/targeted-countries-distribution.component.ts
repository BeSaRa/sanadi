import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ProjectFundraising} from "@app/models/project-fundraising";
import {ProjectFundraisingService} from "@services/project-fundraising.service";
import {Country} from "@app/models/country";
import {OperationTypes} from "@app/enums/operation-types.enum";
import {BehaviorSubject, Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {LangService} from "@services/lang.service";
import {UntypedFormControl} from "@angular/forms";
import {AmountOverCountry} from "@app/models/amount-over-country";

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

  item: UntypedFormControl = new UntypedFormControl()

  private destroy$: Subject<any> = new Subject<any>()

  private countriesChange$: BehaviorSubject<number[] | undefined> = new BehaviorSubject<number[] | undefined>(undefined)

  displayedColumns: string[] = ['country', 'amount'];


  @Input()
  set countriesChange(value: number[]) {
    this.countriesChange$.next(value)
  }


  constructor(private service: ProjectFundraisingService, public lang: LangService) {
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
    this.listenToCountriesChanges()
  }

  private listenToCountriesChanges() {
    this.countriesChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        console.log(val);
      })
  }

  itemExists(id: number): boolean {
    return (this.countriesChange$.value ?? []).includes(id)
  }

  addItem(): void {
    console.log('ADD');
  }

  deleteCountry(row: AmountOverCountry) {

  }
}
