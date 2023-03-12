import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {LangService} from '@services/lang.service';
import {Country} from '@models/country';
import {CountryService} from '@services/country.service';
import {filter, map, take, takeUntil, tap} from 'rxjs/operators';
import {Lookup} from '@models/lookup';
import {BankAccount} from '@models/bank-account';
import {BehaviorSubject, Subject} from 'rxjs';
import {UserClickOn} from '@enums/user-click-on.enum';
import {DialogService} from '@services/dialog.service';
import {ToastService} from '@services/toast.service';
import {ReadinessStatus} from '@app/types/types';
import {LookupService} from '@services/lookup.service';
import {CaseTypes} from '@enums/case-types.enum';
import { ActionIconsEnum } from '@enums/action-icons-enum';
import { CommonUtils } from '@helpers/common-utils';
import { SortEvent } from '@contracts/sort-event';
import { AdminResult } from '@models/admin-result';
import { IMenuItem } from '@modules/context-menu/interfaces/i-menu-item';

@Component({
  selector: 'bank-account',
  templateUrl: './bank-account.component.html',
  styleUrls: ['./bank-account.component.scss']
})
export class BankAccountComponent implements OnInit {

  constructor(public lang: LangService,
              private toastService: ToastService,
              private dialogService: DialogService,
              private lookupService: LookupService,
              private fb: UntypedFormBuilder) {
  }

  @Output() readyEvent = new EventEmitter<ReadinessStatus>();
  private _list: BankAccount[] = [];

  @Input() set list(list: BankAccount[]) {
    this._list = list;
    this.dataSource.next(this._list);
  }

  get list(): BankAccount[] {
    return this._list;
  }

  @Input() countriesList: Country[] = [];
  @Input() readonly: boolean = false;
  @Input() caseType?: CaseTypes;

  bankCategoriesList: Lookup[] = this.lookupService.listByCategory.BankCategory;
  currenciesList: Lookup[] = this.lookupService.listByCategory.Currency;
  caseTypes = CaseTypes;

  dataSource: BehaviorSubject<BankAccount[]> = new BehaviorSubject<BankAccount[]>([]);
  columns = ['bankName', 'accountNumber', 'iBan', 'country', 'actions'];

  editItem?: BankAccount;
  showForm: boolean = false;
  viewOnly: boolean = false;
  filterControl: UntypedFormControl = new UntypedFormControl('');

  add$: Subject<any> = new Subject<any>();
  private save$: Subject<any> = new Subject<any>();

  private changed$: Subject<BankAccount | null> =
    new Subject<BankAccount | null>();
  private current?: BankAccount;
  private destroy$: Subject<any> = new Subject<any>();

  form!: UntypedFormGroup;
  actions: IMenuItem<BankAccount>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: BankAccount) => this.edit(item),
      show: (_item: BankAccount) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: BankAccount) => this.delete(item),
      show: (_item: BankAccount) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: BankAccount) => this.view(item),
      show: (_item: BankAccount) => this.readonly
    }
  ];
  sortingCallbacks = {
    country: (a: BankAccount, b: BankAccount, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.countryInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.countryInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },


  }
  ngOnInit(): void {
    this.dataSource.next(this.list);
    this.buildForm();
    this.listenToAdd();
    this.listenToChange();
    this.listenToSave();
    this._setComponentReadiness('READY');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  private buildForm() {
    this.form = this.fb.group(
      new BankAccount().getBankAccountFields(true,this.caseType)
    );
  }

  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.viewOnly = false;
      this.changed$.next(new BankAccount());
    });
  }

  private listenToChange() {
    this.changed$.pipe(takeUntil(this.destroy$)).subscribe((record) => {
      this.current = record || undefined;
      this.showForm = !!this.current;
      this.updateForm(this.current);
    });
  }

  private updateForm(record: BankAccount | undefined) {
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

  save() {
    if (this.readonly || this.viewOnly) {
      return;
    }
    this.save$.next();
  }
  private displayRequiredFieldsMessage(): void {
    this.dialogService
      .error(this.lang.map.msg_all_required_fields_are_filled)
      .onAfterClose$.pipe(take(1))
      .subscribe(() => {
        this.form.markAllAsTouched();
      });
  }
  private listenToSave() {
    this.save$
      .pipe(
        takeUntil(this.destroy$),
        tap((_) =>
          this.form.invalid ? this.displayRequiredFieldsMessage() : true
        ),
        filter(() => this.form.valid),
        filter(() => {
          const formValue = this.form.getRawValue();
          const isDuplicate = this.list.some((x) => x === formValue);
          if (isDuplicate) {
            this.toastService.alert(this.lang.map.msg_duplicated_item);
          }
          return !isDuplicate;
        }),
        map(() => {
          let formValue = this.form.getRawValue();
          let countryInfo: AdminResult =
            this.countriesList
              .find((x) => x.id === formValue.country)
              ?.createAdminResult() ?? new AdminResult();

          return new BankAccount().clone({
            ...this.current,
            ...formValue,
            countryInfo: countryInfo,
          });
        })
      )
      .subscribe((record: BankAccount) => {
        if (!record) {
          return;
        }
        this._updateList(record, !!this.editItem ? 'UPDATE' : 'ADD');
        this.toastService.success(this.lang.map.msg_save_success);
        this.changed$.next(null);
        this.cancel();
      });

  }

  private _updateList(
    record: BankAccount | null,
    operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE',
  ) {
    if (record) {
      if (operation === 'ADD') {
        this.list.push(record);
      } else {
        let index = !this.editItem ? -1 : this.list.findIndex(x => x === this.editItem);
        if (operation === 'UPDATE') {
          this.list.splice(index, 1, record);
        } else if (operation === 'DELETE') {
          this.list.splice(index, 1);
        }
      }
    }
    this.list = this.list.slice();
  }

  edit(record: BankAccount, $event?: MouseEvent) {
    $event?.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editItem = record;
    this.viewOnly = false;
    this.changed$.next(record);
  }

  view(record: BankAccount, $event?: MouseEvent) {
    $event?.preventDefault();
    this.editItem = record;
    this.viewOnly = true;
    this.changed$.next(record);
  }

  delete(record: BankAccount, $event?: MouseEvent): any {
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
          this.cancel();
        }
      });
  }
  cancel() {
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

  private _setComponentReadiness(readyStatus: ReadinessStatus) {
    this.readyEvent.emit(readyStatus);
  }

  forceClearComponent() {
    this.cancel();
    this.list = [];
    this._updateList(null, 'NONE');
    this._setComponentReadiness('READY');
  }
}
