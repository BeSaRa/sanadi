import {Component, Input, OnDestroy, OnInit} from '@angular/core';
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

@Component({
  selector: 'targeted-years-distribution',
  templateUrl: './targeted-years-distribution.component.html',
  styleUrls: ['./targeted-years-distribution.component.scss']
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

  @Input()
  set numberOfMonths(value: number) {
    this.numberOfMonths$.next(value);
  }

  public form: UntypedFormGroup = new FormGroup<any>({
    list: new UntypedFormArray([])
  })

  displayedColumns = ['year', 'amount'];

  get list(): UntypedFormArray {
    return this.form.get('list')! as UntypedFormArray
  }

  constructor(private service: ProjectFundraisingService,
              public lang: LangService,
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
  }

  addItem(): void {
    if (!this.item.value)
      return;

    const year = new AmountOverYear().clone({year: this.item.value, targetAmount: 0});
    const control = this.createControl(year.year, year.targetAmount)

    this.listenToControl(control, this.list.length)
    this.list.push(control)
    this.model.addYear(year)
    this.updateSelectedList()
    this.item.setValue(null)
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
  }

  private listenToControl(control: AbstractControl, index: number): void {
    const input = (control as UntypedFormGroup).controls.targetAmount;
    const value = input.value;
    input.valueChanges
      .pipe(takeUntil(this.destroyListener$))
      .pipe(startWith(Number(value)))
      .pipe(debounceTime(300))
      .pipe(map(val => Number(val)))
      .subscribe((value: number) => {
        let currentValue = this.list.controls.reduce((acc, con, currentIndex) => {
          return acc + (currentIndex !== index ? Number(con.value) : 0)
        }, 0) + value
        if (currentValue > this.model.targetAmount) {
          const toBeRemoved = currentValue - this.model.targetAmount;
          const correctedValue = (currentValue - toBeRemoved)
          input.setValue(correctedValue, {emitEvent: false})
          this.model.updateYear(correctedValue, index)
        } else {
          this.model.updateYear(value, index)
        }
      })
  }
}
