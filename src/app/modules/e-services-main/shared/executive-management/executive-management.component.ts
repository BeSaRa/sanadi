import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {CountryService} from '@app/services/country.service';
import {ToastService} from '@app/services/toast.service';
import {DialogService} from '@app/services/dialog.service';
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {Country} from '@app/models/country';
import {ReadinessStatus} from '@app/types/types';
import {BehaviorSubject, Subject} from 'rxjs';
import {ExecutiveManagement} from '@app/models/executive-management';
import {filter, map, take, takeUntil, tap} from 'rxjs/operators';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { CommonUtils } from '@app/helpers/common-utils';
import { SortEvent } from '@app/interfaces/sort-event';
import { AdminResult } from '@app/models/admin-result';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';

@Component({
  selector: 'executive-management',
  templateUrl: './executive-management.component.html',
  styleUrls: ['./executive-management.component.scss']
})
export class ExecutiveManagementComponent implements OnInit {

  constructor(public lang: LangService,
              private countryService: CountryService,
              private toastService: ToastService,
              private dialogService: DialogService,
              private fb: UntypedFormBuilder) {
  }

  @Output() readyEvent = new EventEmitter<ReadinessStatus>();

  private _list: ExecutiveManagement[] = [];
  @Input() set list(list: ExecutiveManagement[]) {
    this._list = list;
    this.dataSource.next(this._list);
  }

  get list(): ExecutiveManagement[] {
    return this._list;
  }
  @Input() countriesList: Country[] = [];
  @Input() readonly: boolean = false;
  @Input() pageTitleKey: keyof ILanguageKeys = 'managers';

  dataSource: BehaviorSubject<ExecutiveManagement[]> = new BehaviorSubject<
  ExecutiveManagement[]
>([]);  columns = ['arabicName', 'englishName', 'email', 'country','actions'];
  editItem?: ExecutiveManagement;
  showForm: boolean = false;
  viewOnly: boolean = false;
  filterControl: UntypedFormControl = new UntypedFormControl('');

  add$: Subject<any> = new Subject<any>();
  private save$: Subject<any> = new Subject<any>();

  private changed$: Subject<ExecutiveManagement | null> =
    new Subject<ExecutiveManagement | null>();
  private current?: ExecutiveManagement;
  private destroy$: Subject<any> = new Subject<any>();

  form!: UntypedFormGroup;
  actions: IMenuItem<ExecutiveManagement>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: ExecutiveManagement) => this.edit(item),
      show: (_item: ExecutiveManagement) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: ExecutiveManagement) => this.delete(item),
      show: (_item: ExecutiveManagement) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: ExecutiveManagement) => this.view(item),
      show: (_item: ExecutiveManagement) => this.readonly
    }
  ];
  sortingCallbacks = {
    country: (a: ExecutiveManagement, b: ExecutiveManagement, dir: SortEvent): number => {
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
      new ExecutiveManagement().getManagerFields(true)
    );
  }

  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.viewOnly = false;
      this.changed$.next(new ExecutiveManagement());
    });
  }

  private listenToChange() {
    this.changed$.pipe(takeUntil(this.destroy$)).subscribe((record) => {
      this.current = record || undefined;
      this.showForm = !!this.current;
      this.updateForm(this.current);
    });
  }

  private updateForm(record: ExecutiveManagement | undefined) {
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

          return new ExecutiveManagement().clone({
            ...this.current,
            ...formValue,
            countryInfo: countryInfo,
          });
        })
      )
      .subscribe((record: ExecutiveManagement) => {
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
    record: ExecutiveManagement | null,
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

  edit(record: ExecutiveManagement, $event?: MouseEvent) {
    $event?.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editItem = record;
    this.viewOnly = false;
    this.changed$.next(record);
  }

  view(record: ExecutiveManagement, $event?: MouseEvent) {
    $event?.preventDefault();
    this.editItem = record;
    this.viewOnly = true;
    this.changed$.next(record);
  }

  delete(record: ExecutiveManagement, $event?: MouseEvent): any {
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
