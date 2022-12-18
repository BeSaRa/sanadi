import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {OperationTypes} from "@app/enums/operation-types.enum";
import {ProjectFundraising} from "@app/models/project-fundraising";
import {ProjectFundraisingService} from "@services/project-fundraising.service";
import {LangService} from "@services/lang.service";
import {DeductionRatioItem} from "@app/models/deduction-ratio-item";
import {AbstractControl, FormGroup, UntypedFormArray, UntypedFormControl, UntypedFormGroup} from "@angular/forms";
import {BehaviorSubject, combineLatest, Subject} from "rxjs";
import {debounceTime, distinctUntilChanged, filter, startWith, switchMap, takeUntil} from "rxjs/operators";
import {CustomValidators} from "@app/validators/custom-validators";
import {DeductedPercentage} from "@app/models/deducted-percentage";
import {DialogService} from "@services/dialog.service";
import {UserClickOn} from "@app/enums/user-click-on.enum";
import currency from "currency.js";

@Component({
  selector: 'deduction-ratio-manager',
  templateUrl: './deduction-ratio-manager.component.html',
  styleUrls: ['./deduction-ratio-manager.component.scss']
})
export class DeductionRatioManagerComponent implements OnInit, OnDestroy {
  @Input()
  operation!: OperationTypes
  @Input()
  model!: ProjectFundraising
  displayedColumns = ['arabic_name', 'english_name', 'percentage'];
  private _permitType: BehaviorSubject<number | undefined> = new BehaviorSubject<number | undefined>(undefined);
  private _workArea: BehaviorSubject<number | undefined> = new BehaviorSubject<number | undefined>(undefined);
  private destroy$: Subject<void> = new Subject<void>()
  private itemsIds: number [] = []
  private deductionRatioItemsMap: Record<number, DeductionRatioItem> = {}
  private destroyInputsListeners: Subject<any> = new Subject<any>()
  deductionRatioItems: DeductionRatioItem[] = [];
  item: UntypedFormControl = new UntypedFormControl();
  maskPattern = CustomValidators.inputMaskPatterns;
  totalDeductionRatio: number = 0;
  @Input()
  checkForTemplate: boolean = false;
  clearItems$: Subject<boolean> = new Subject()
  form: UntypedFormGroup = new FormGroup<any>({
    list: new UntypedFormArray([])
  })
  @Output()
  afterClearItems: EventEmitter<void> = new EventEmitter<void>()
  @Output()
  deductionChange: EventEmitter<number> = new EventEmitter<number>()
  @Input()
  readonly: boolean = false;
  totalAdminRatio: number = 0;
  deductionAmountHasChanges$: Subject<any> = new Subject<any>()

  @Input()
  set clearItems(value: boolean) {
    this.clearItems$.next(value)
  }

  constructor(private service: ProjectFundraisingService,
              private dialog: DialogService,
              public lang: LangService) {
  }

  @Input()
  set permitType(value: number) {
    this._permitType.next(value)
  }

  @Input()
  set workArea(value: number) {
    this._workArea.next(value)
  }

  get list(): UntypedFormArray {
    return this.form.get('list') as UntypedFormArray;
  }

  private generateFormArray(): void {
    this.model.deductedPercentagesItemList.forEach(item => this.list.push(this.addController(item.deductionType, item.deductionPercent)))
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroyInputsListeners.next()
    this.destroy$.complete()
    this.destroyInputsListeners.complete()
    this.destroy$.unsubscribe()
    this.destroyInputsListeners.unsubscribe()
  }

  ngOnInit(): void {
    this.generateFormArray();
    this.calculateDeductionRatio();
    this.createInputListeners();
    if (this.operation === OperationTypes.CREATE) {
      this.displayedColumns = this.displayedColumns.concat(['actions'])
    }
    this.listenToUpdates();
    this.updateItemIds();
    this.listenToClearItems();
    this.listenToDeductionChanges()
  }


  private listenToUpdates(): void {
    combineLatest([this._permitType, this._workArea])
      .pipe(takeUntil(this.destroy$))
      .pipe(filter<[number | undefined, number | undefined], [number, number]>((value): value is [number, number] => !!(value[0] && value[1])))
      .pipe(switchMap(([permitType, workArea]) => this.service.loadDeductionRatio({permitType, workArea})))
      .subscribe((items) => {
        this.deductionRatioItems = items;
        this.updateDeductionMap()
      })
  }

  addItem(): void {
    if (this.checkForTemplate && !this.model.hasTemplate()) {
      this.dialog.alert(this.lang.map.please_add_template_to_proceed)
      return
    }

    const item = (this.item.value as DeductionRatioItem).convertToDeductionPercent()
    const control = this.addController(item.deductionType, item.deductionPercent);
    this.listenToControl(control)
    this.list.push(control)
    this.model.addDeductionRatioItem(item)
    this.item.setValue(null)
    this.updateItemIds()
  }

  itemExists(id: number) {
    return this.itemsIds.includes(id)
  }

  updateDeductionMap(): void {
    this.deductionRatioItemsMap = this.deductionRatioItems.reduce((acc, current) => {
      return {...acc, [current.id]: current}
    }, {})
  }

  private updateItemIds(): number[] {
    this.itemsIds = this.model.deductedPercentagesItemList.map(item => item.deductionType)
    return this.itemsIds
  }

  private addController(id: number, value?: any): AbstractControl {
    return new UntypedFormGroup({
      id: new UntypedFormControl(id),
      value: new UntypedFormControl(value)
    })
  }

  private listenToControl(formGroup: AbstractControl): void {
    const group = (formGroup as UntypedFormGroup)
    const id = group.controls.id.value;
    const input = group.controls.value;
    input
      .valueChanges
      .pipe(takeUntil(this.destroyInputsListeners))
      .pipe(startWith(Number(input.value)))
      .pipe(debounceTime(400))
      .subscribe((newValue) => {
        newValue = Number(newValue);
        const item = this.deductionRatioItemsMap[id];
        if (item) {
          if (newValue > item.maxLimit) {
            input.setValue(item.maxLimit, {
              emitEvent: false
            })
          } else if (newValue < item.minLimit) {
            input.setValue(item.minLimit, {
              emitEvent: false
            })
          }
        }
        this.model.updateDeductionRatioItem(Number(id), Number(input.getRawValue()))
        this.calculateDeductionRatio()
        this.deductionAmountHasChanges$.next(input.getRawValue())
      })
  }

  private createInputListeners(): void {
    this.list.controls.forEach((control) => {
      this.listenToControl(control)
    })
  }

  private calculateDeductionRatio(): number {
    this.totalDeductionRatio = this.list.controls.reduce((total, group) => {
      const value = (group as unknown as UntypedFormGroup).controls.value.value
      const numValue = Number(value ? value : 0)
      return total + numValue;
    }, 0)
    this.calculateTotalAdminDeduction()
    return this.totalDeductionRatio;
  }

  private calculateTotalAdminDeduction(): number {
    this.totalAdminRatio = currency((this.totalDeductionRatio * this.model.projectTotalCost) / 100).value;
    this.model.setTargetAmount(currency(this.totalAdminRatio).value + currency(this.model.projectTotalCost).value);
    this.model.administrativeDeductionAmount = this.totalAdminRatio;
    return this.totalAdminRatio;
  }

  removeItem(item: DeductedPercentage, index: number) {
    this.dialog.confirm(this.lang.map.msg_confirm_delete_x.change({x: item.deductionTypeInfo.getName()}))
      .onAfterClose$
      .pipe(filter((click: UserClickOn) => click === UserClickOn.YES))
      .subscribe(() => {
        this.model.removeDeductionRatioItem(item)
        this.list.removeAt(index)
        this.updateItemIds()
        this.calculateDeductionRatio()
      })
  }

  private listenToClearItems() {
    this.clearItems$
      .pipe(takeUntil(this.destroy$))
      .pipe(filter(value => value))
      .subscribe(() => {
        this.model && this.model.clearDeductionItems()
        this.updateItemIds()
        this.destroyInputsListeners.next(true)
        this.list.clear()
        this.calculateDeductionRatio()
        this.afterClearItems.emit()
      })
  }

  private listenToDeductionChanges() {
    this.deductionAmountHasChanges$
      .pipe(debounceTime(300))
      .pipe(distinctUntilChanged())
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: number) => {
        this.deductionChange.emit(value)
      })
  }
}
