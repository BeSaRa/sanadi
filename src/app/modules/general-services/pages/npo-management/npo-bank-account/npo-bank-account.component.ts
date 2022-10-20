import { CurrencyEnum } from '@app/enums/currency-enum';
import { Bank } from './../../../../../models/bank';
import { NpoBankAccount } from './../../../../../models/npo-bank-account';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { LangService } from '@app/services/lang.service';
import { filter, map, take, takeUntil } from 'rxjs/operators';
import { Lookup } from '@app/models/lookup';
import { BehaviorSubject, Subject } from 'rxjs';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { DialogService } from '@app/services/dialog.service';
import { ToastService } from '@app/services/toast.service';
import { ReadinessStatus } from '@app/types/types';
import { LookupService } from '@app/services/lookup.service';
import { CaseTypes } from '@app/enums/case-types.enum';

@Component({
  selector: 'npo-bank-account',
  templateUrl: './npo-bank-account.component.html',
  styleUrls: ['./npo-bank-account.component.scss']
})
export class NpoBankAccountComponent implements OnInit {
  constructor(public lang: LangService,
    private toastService: ToastService,
    private dialogService: DialogService,
    private lookupService: LookupService,
    private fb: UntypedFormBuilder) {
  }

  @Output() readyEvent = new EventEmitter<ReadinessStatus>();
  private _list: NpoBankAccount[] = [];

  @Input() set list(list: NpoBankAccount[]) {
    this._list = list;
    this.listDataSource.next(this._list);
  }

  get list(): NpoBankAccount[] {
    return this._list;
  }

  @Input() readonly: boolean = false;
  @Input() caseType?: CaseTypes;
  @Input() bankList: Bank[] = [];
  currenciesList: Lookup[] = this.lookupService.listByCategory.Currency;
  caseTypes = CaseTypes;

  listDataSource: BehaviorSubject<NpoBankAccount[]> = new BehaviorSubject<NpoBankAccount[]>([]);
  columns = ['accountNumber', 'iban', 'actions'];

  editRecordIndex: number = -1;
  viewOnly: boolean = false;
  private save$: Subject<any> = new Subject<any>();

  add$: Subject<any> = new Subject<any>();
  private recordChanged$: Subject<NpoBankAccount | null> = new Subject<NpoBankAccount | null>();
  private currentRecord?: NpoBankAccount;
  private destroy$: Subject<any> = new Subject<any>();

  form!: UntypedFormGroup;

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

  get bankAccountsFormArray(): UntypedFormArray {
    return (this.form.get('bankAccount')) as UntypedFormArray;
  }

  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log('asaf')
        this.viewOnly = false;
        const modal = new NpoBankAccount();
        modal.currency = CurrencyEnum.UNITED_STATE_DOLLAR;
        this.recordChanged$.next(modal);
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

  private updateForm(bankAccount: NpoBankAccount | undefined) {
    const bankAccountFormArray = this.bankAccountsFormArray;
    bankAccountFormArray.clear();
    if (bankAccount) {
      if (this.viewOnly) {
        this._setComponentReadiness('READY');
      } else {
        this._setComponentReadiness('NOT_READY');
      }
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
      filter((form) => {
        const valid = this._list.findIndex(f => f.accountNumber == form.value.accountNumber) == -1;
        !valid && this.editRecordIndex == -1 && this.dialogService
          .error(this.lang.map.msg_user_identifier_is_already_exist)
          .onAfterClose$
          .pipe(take(1))
          .subscribe(() => {
            this.form.get('bankAccount')?.markAllAsTouched();
          });
        return valid || this.editRecordIndex != -1
      }),
      map(() => {
        return (this.form.get('bankAccount.0')) as UntypedFormArray;
      }),
      map((form) => {
        return (new NpoBankAccount()).clone({
          ...this.currentRecord, ...form.getRawValue()
        });
      })
    ).subscribe((bankAccount: NpoBankAccount) => {
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

  private _updateList(record: (NpoBankAccount | null), operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE', gridIndex: number = -1) {
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

  editBankAccount($event: MouseEvent, record: NpoBankAccount, index: number) {
    $event.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editRecordIndex = index;
    this.viewOnly = false;
    this.recordChanged$.next(record);
  }

  view($event: MouseEvent, record: NpoBankAccount, index: number) {
    $event.preventDefault();
    this.editRecordIndex = index;
    this.viewOnly = true;
    this.recordChanged$.next(record);
  }

  deleteBankAccount($event: MouseEvent, record: NpoBankAccount, index: number): any {
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
