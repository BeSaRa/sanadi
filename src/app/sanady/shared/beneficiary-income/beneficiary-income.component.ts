import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {LookupService} from '@app/services/lookup.service';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {ReadinessStatus} from '@app/types/types';
import {BeneficiaryIncome} from '@app/models/beneficiary-income';
import {CustomValidators} from '@app/validators/custom-validators';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {BehaviorSubject, Subject} from 'rxjs';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';
import {filter, map, take, takeUntil, tap} from 'rxjs/operators';
import {Lookup} from '@app/models/lookup';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {Beneficiary} from '@app/models/beneficiary';
import {TableComponent} from '@app/shared/components/table/table.component';
import {BeneficiaryIncomePeriodicEnum} from '@app/enums/periodic-payment.enum';

@Component({
  selector: 'beneficiary-income',
  templateUrl: './beneficiary-income.component.html',
  styleUrls: ['./beneficiary-income.component.scss']
})
export class BeneficiaryIncomeComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor(public lang: LangService,
              private lookupService: LookupService,
              private fb: UntypedFormBuilder,
              private dialogService: DialogService,
              private toastService: ToastService) {
  }

  ngOnInit(): void {
    this.buildForm();
    this.listenToAdd();
    this.listenToRecordChange();
    this.listenToSave();
    this._setComponentReadiness('READY');
  }

  ngAfterViewInit() {
    if (this.readonly) {
      this.columns.splice(this.columns.indexOf('actions'), 1);
    }
    this._setFooterLabelColspan();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  form!: UntypedFormGroup;
  @ViewChild('table') table!: TableComponent;

  @Output() readyEvent = new EventEmitter<ReadinessStatus>();
  @Input() readonly: boolean = false;
  @Input() beneficiary?: Beneficiary;

  // @Input() list: BeneficiaryIncome[] = [];
  private _list: BehaviorSubject<any> = new BehaviorSubject<any>([]);

  @Input()
  set list(value: BeneficiaryIncome[]) {
    this._list.next(value);
  }

  get list(): BeneficiaryIncome[] {
    return this._list.value;
  }

  headerColumn: string[] = ['extra-header'];
  columns = ['incomeType', 'periodicType', 'amount', 'actions'];
  footerColumns: string[] = ['totalIncomeLabel', 'totalIncome'];
  footerLabelColSpan: number = 0;
  incomeTypeList = this.lookupService.listByCategory.BENEFICIARY_INCOME;
  periodicTypeList = this.lookupService.listByCategory.BENEFICIARY_INCOME_PERODIC;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  filterControl: UntypedFormControl = new UntypedFormControl('');
  viewOnly: boolean = false;
  customValidators = CustomValidators;

  add$: Subject<any> = new Subject<any>();
  editItem?: BeneficiaryIncome;
  private save$: Subject<void> = new Subject<void>();
  private recordChanged$: Subject<BeneficiaryIncome | null> = new Subject<BeneficiaryIncome | null>();
  private currentRecord?: BeneficiaryIncome;
  private destroy$: Subject<void> = new Subject();

  showForm: boolean = false;

  actions: IMenuItem<BeneficiaryIncome>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: BeneficiaryIncome) => this.edit(item),
      show: (_item: BeneficiaryIncome) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: BeneficiaryIncome) => this.delete(item),
      show: (_item: BeneficiaryIncome) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: BeneficiaryIncome) => this.view(item),
      show: (_item: BeneficiaryIncome) => this.readonly
    }
  ];

  sortingCallbacks = {
    periodicType: (a: BeneficiaryIncome, b: BeneficiaryIncome, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.periodicTypeInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.periodicTypeInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    incomeType: (a: BeneficiaryIncome, b: BeneficiaryIncome, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.benIncomeTypeInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.benIncomeTypeInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  };

  buildForm(): void {
    let model = new BeneficiaryIncome().clone(this.currentRecord);
    this.form = this.fb.group(model.buildForm(true));
  }

  private _setFooterLabelColspan(): void {
    if (this.readonly) {
      this.footerLabelColSpan = this.columns.length - 1;
    } else {
      this.footerLabelColSpan = this.columns.length - 2;
    }
  }

  isTouchedOrDirty(): boolean {
    return this.form && (this.form.touched || this.form.dirty);
  }

  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.viewOnly = false;
        this.recordChanged$.next(new BeneficiaryIncome());
      });
  }

  private listenToRecordChange() {
    this.recordChanged$.pipe(takeUntil(this.destroy$)).subscribe((record) => {
      this.currentRecord = record || undefined;
      this.showForm = !!this.currentRecord;
      this.updateForm(this.currentRecord);
    });
  }

  save() {
    if (this.readonly || this.viewOnly) {
      return;
    }
    this.save$.next();
  }

  private displayRequiredFieldsMessage(): void {
    this.dialogService.error(this.lang.map.msg_all_required_fields_are_filled).onAfterClose$
      .pipe(take(1))
      .subscribe(() => {
        this.form.markAllAsTouched();
      });
  }

  private listenToSave() {
    this.save$.pipe(
      takeUntil(this.destroy$),
      tap(_ => this.form.invalid ? this.displayRequiredFieldsMessage() : true),
      filter(() => this.form.valid),
      map(() => {
        let formValue = this.form.getRawValue();
        return (new BeneficiaryIncome()).clone({
          ...this.currentRecord, ...formValue,

          periodicTypeInfo: this.lookupService.listByCategory.BENEFICIARY_INCOME_PERODIC.find(x => x.lookupKey === formValue.periodicType) || new Lookup(),
          benIncomeTypeInfo: this.lookupService.listByCategory.BENEFICIARY_INCOME.find(x => x.lookupKey === formValue.benIncomeType) || new Lookup(),
        });
      })
    ).subscribe(recordToSave => {
      this._updateList(recordToSave, (!!this.editItem ? 'UPDATE' : 'ADD'));
      this.toastService.success(this.lang.map.msg_save_success);
      this.recordChanged$.next(null);
      this.cancelForm();
    });
  }

  private updateForm(record: BeneficiaryIncome | undefined) {
    if (record) {
      if (this.viewOnly) {
        this._setComponentReadiness('READY');
      } else {
        this._setComponentReadiness('NOT_READY');
      }
      this.form.patchValue(record);
      if (this.readonly || this.viewOnly) {
        this.form.disable();
      }
    } else {
      this._setComponentReadiness('READY');
    }
  }

  cancelForm() {
    this.resetForm();
    this.showForm = false;
    this.editItem = undefined;
    this.viewOnly = false;
    this._setComponentReadiness('READY');
  }

  private resetForm() {
    this.form.reset();
    this.form.markAsUntouched();
    this.form.markAsPristine();
  }

  forceClearComponent() {
    this.cancelForm();
    this.list = [];
    this._updateList(null, 'NONE');
  }

  edit(record: BeneficiaryIncome, $event?: MouseEvent) {
    $event?.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editItem = record;
    this.viewOnly = false;
    this.recordChanged$.next(record);
  }

  view(record: BeneficiaryIncome, $event?: MouseEvent) {
    $event?.preventDefault();
    this.editItem = record;
    this.viewOnly = true;
    this.recordChanged$.next(record);
  }

  delete(record: BeneficiaryIncome, $event?: MouseEvent): any {
    $event?.preventDefault();
    if (this.readonly) {
      return;
    }
    this.dialogService.confirm(this.lang.map.msg_confirm_delete_selected)
      .onAfterClose$
      .pipe(take(1))
      .subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          this.editItem = record;
          this._updateList(record, 'DELETE');
          this.toastService.success(this.lang.map.msg_delete_success);
          this.cancelForm();
        }
      });
  }

  private _updateList(record: (BeneficiaryIncome | null), operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE') {
    if (record) {
      let index = !this.editItem ? -1 : this.list.findIndex(x => x === this.editItem);
      if (operation === 'ADD') {
        this.list.push(record);
      } else if (operation === 'UPDATE') {
        let index = this.list.findIndex(x => x === this.editItem);
        this.list.splice(index, 1, record);
      } else if (operation === 'DELETE') {
        this.list.splice(index, 1);
      }
    }
    this.list = this.list.slice();
  }


  private _setComponentReadiness(readyStatus: ReadinessStatus) {
    this.readyEvent.emit(readyStatus);
  }

  calculateTotalIncome(): number {
    if (!this.list || this.list.length === 0) {
      return 0;
    } else {
      return this.list.map(x => {
        if (!x.amount) {
          return 0;
        }
        if (x.periodicType === BeneficiaryIncomePeriodicEnum.MONTHLY) {
          return (Number(Number(x.amount).toFixed(2)) * x.yearlyInstallmentsCount);
        } else {
          return Number(Number(x.amount).toFixed(2));
        }
      }).reduce((resultSum, a) => resultSum + a, 0);
    }
  }

}
