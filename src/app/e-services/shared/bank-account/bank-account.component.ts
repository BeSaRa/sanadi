import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {LangService} from '@app/services/lang.service';
import {Country} from '@app/models/country';
import {CountryService} from '@app/services/country.service';
import {filter, map, take, takeUntil} from 'rxjs/operators';
import {Lookup} from '@app/models/lookup';
import {BankAccount} from '@app/models/bank-account';
import {BehaviorSubject, Subject} from 'rxjs';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {ReadinessStatus} from '@app/types/types';
import {LookupService} from '@app/services/lookup.service';

@Component({
  selector: 'bank-account',
  templateUrl: './bank-account.component.html',
  styleUrls: ['./bank-account.component.scss']
})
export class BankAccountComponent implements OnInit {

  constructor(public lang: LangService,
              private countryService: CountryService,
              private toastService: ToastService,
              private dialogService: DialogService,
              private lookupService: LookupService,
              private fb: FormBuilder) {
  }

  @Output() readyEvent = new EventEmitter<ReadinessStatus>();
  private _list: BankAccount[] = [];

  @Input() set list(list: BankAccount[]) {
    this._list = list;
    this.listDataSource.next(this._list);
  }

  get list(): BankAccount[] {
    return this._list;
  }

  @Input() countriesList: Country[] = [];
  @Input() readonly: boolean = false;

  bankCategoriesList: Lookup[] = this.lookupService.listByCategory.BankCategory;
  currenciesList: Lookup[] = this.lookupService.listByCategory.Currency;

  listDataSource: BehaviorSubject<BankAccount[]> = new BehaviorSubject<BankAccount[]>([]);
  columns = ['bankName', 'accountNumber', 'iBan', 'swiftCode', 'actions'];

  editRecordIndex: number = -1;
  viewOnly: boolean = false;
  private save$: Subject<any> = new Subject<any>();

  add$: Subject<any> = new Subject<any>();
  private recordChanged$: Subject<BankAccount | null> = new Subject<BankAccount | null>();
  private currentRecord?: BankAccount;
  private destroy$: Subject<any> = new Subject<any>();

  form!: FormGroup;

  ngOnInit(): void {
    this.buildForm();
    this.listenToAdd();
    this.listenToRecordChange();
    this.listenToSave();
    this._setComponentReadiness('READY');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  private _setComponentReadiness(readyStatus: ReadinessStatus) {
    this.readyEvent.emit(readyStatus);
  }

  buildForm(): void {
    this.form = this.fb.group({
      bankAccount: this.fb.array([])
    });
  }

  addBankAccountAllowed(): boolean {
    return !this.readonly;
  }

  get bankAccountsFormArray(): FormArray {
    return (this.form.get('bankAccount')) as FormArray;
  }

  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.viewOnly = false;
        this.recordChanged$.next(new BankAccount());
      });
  }

  private listenToRecordChange() {
    this.recordChanged$.pipe(takeUntil(this.destroy$)).subscribe((bankAccount) => {
      /*if (this.readonly) {
        return;
      }*/
      this.currentRecord = bankAccount || undefined;
      this.updateForm(this.currentRecord);
    });
  }

  private updateForm(bankAccount: BankAccount | undefined) {
    const bankAccountFormArray = this.bankAccountsFormArray;
    bankAccountFormArray.clear();
    if (bankAccount) {
      this._setComponentReadiness('NOT_READY');
      bankAccountFormArray.push(this.fb.group(bankAccount.getBankAccountFields(true)));
      if (this.readonly || this.viewOnly) {
        this.bankAccountsFormArray.disable();
      }
    } else {
      this._setComponentReadiness('READY');
    }
  }

  saveBankAccount() {
    if (this.readonly || this.viewOnly) {
      return;
    }
    this.save$.next();
  }

  private listenToSave() {
    const bankAccountForm$ = this.save$.pipe(map(() => {
      return (this.form.get('bankAccount.0')) as AbstractControl;
    }));

    const validForm$ = bankAccountForm$.pipe(filter((form) => form.valid));
    const invalidForm$ = bankAccountForm$.pipe(filter((form) => form.invalid));
    invalidForm$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.dialogService
        .error(this.lang.map.msg_all_required_fields_are_filled)
        .onAfterClose$
        .pipe(take(1))
        .subscribe(() => {
          this.form.get('bankAccount')?.markAllAsTouched();
        });
    });

    validForm$.pipe(
      takeUntil(this.destroy$),
      map(() => {
        return (this.form.get('bankAccount.0')) as FormArray;
      }),
      map((form) => {
        return (new BankAccount()).clone({
          ...this.currentRecord, ...form.getRawValue()
        });
      })
    ).subscribe((bankAccount: BankAccount) => {
      if (!bankAccount) {
        return;
      }

      this._updateList(bankAccount, (this.editRecordIndex > -1 ? 'UPDATE' : 'ADD'), this.editRecordIndex);
      this.toastService.success(this.lang.map.msg_save_success);
      this.editRecordIndex = -1;
      this.viewOnly = false;
      this.recordChanged$.next(null);
    });
  }

  private _updateList(record: (BankAccount | null), operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE', gridIndex: number = -1) {
    if (record) {
      if (operation === 'ADD') {
        this.list.push(record);
      } else if (operation === 'UPDATE') {
        this.list.splice(gridIndex, 1, record);
      } else if (operation === 'DELETE') {
        this.list.splice(gridIndex, 1);
      }
    }
    this.list = this.list.slice();
    this.listDataSource.next(this.list);
  }

  cancelBankAccount() {
    this.resetBankAccountForm();
    this._setComponentReadiness('READY');
    this.editRecordIndex = -1;
  }

  private resetBankAccountForm() {
    this.bankAccountsFormArray.clear();
    this.bankAccountsFormArray.markAsUntouched();
    this.bankAccountsFormArray.markAsPristine();
  }

  forceClearComponent() {
    this.cancelBankAccount();
    this.list = [];
    this._updateList(null, 'NONE');
    this._setComponentReadiness('READY');
  }

  editBankAccount($event: MouseEvent, record: BankAccount, index: number) {
    $event.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editRecordIndex = index;
    this.viewOnly = false;
    this.recordChanged$.next(record);
  }

  view($event: MouseEvent, record: BankAccount, index: number) {
    $event.preventDefault();
    this.editRecordIndex = index;
    this.viewOnly = true;
    this.recordChanged$.next(record);
  }

  deleteBankAccount($event: MouseEvent, record: BankAccount, index: number): any {
    $event.preventDefault();
    if (this.readonly) {
      return;
    }
    this.dialogService.confirm(this.lang.map.msg_confirm_delete_selected)
      .onAfterClose$
      .pipe(take(1))
      .subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          this._updateList(record, 'DELETE', index);
          this.toastService.success(this.lang.map.msg_delete_success);
        }
      });
  }
}
