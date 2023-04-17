import { Lookup } from '@models/lookup';
import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {ActionIconsEnum} from '@enums/action-icons-enum';
import {UserClickOn} from '@enums/user-click-on.enum';
import {CommonUtils} from '@helpers/common-utils';
import {SortEvent} from '@contracts/sort-event';
import {AdminResult} from '@models/admin-result';
import {ManagementCouncil} from '@models/management-council';
import {IMenuItem} from '@modules/context-menu/interfaces/i-menu-item';
import {ReadinessStatus} from '@app/types/types';
import {DialogService} from '@services/dialog.service';
import {LangService} from '@services/lang.service';
import {ToastService} from '@services/toast.service';
import {BehaviorSubject, Subject} from 'rxjs';
import {filter, map, take, takeUntil, tap} from 'rxjs/operators';
import { ManagementCouncilPopupComponent } from '../../popups/management-council-popup/management-council-popup.component';

@Component({
  selector: 'management-council',
  templateUrl: './management-council.component.html',
  styleUrls: ['./management-council.component.scss'],
})
export class ManagementCouncilComponent implements OnInit, OnDestroy {
  constructor(
    public lang: LangService,
    private toastService: ToastService,
    private dialogService: DialogService,
    private fb: UntypedFormBuilder
  ) {
  }

  private _list: ManagementCouncil[] = [];
  @Input() set list(list: ManagementCouncil[]) {
    this._list = list;
    this.dataSource.next(this._list);
  }

  get list(): ManagementCouncil[] {
    return this._list;
  }
  @Input() nationalities: Lookup[] = [];
  @Input() readonly: boolean = false;

  @Output() readyEvent = new EventEmitter<ReadinessStatus>();

  dataSource: BehaviorSubject<ManagementCouncil[]> = new BehaviorSubject<
    ManagementCouncil[]
  >([]);
  columns = ['arabicName', 'englishName', 'email', 'nationality', 'passportNumber', 'actions'];
  editItem?: ManagementCouncil;
  viewOnly: boolean = false;
  filterControl: UntypedFormControl = new UntypedFormControl('');

  add$: Subject<any> = new Subject<any>();
  private save$: Subject<any> = new Subject<any>();

  private changed$: Subject<ManagementCouncil | null> =
    new Subject<ManagementCouncil | null>();
  private current?: ManagementCouncil;
  private destroy$: Subject<any> = new Subject<any>();

  form!: UntypedFormGroup;
  actions: IMenuItem<ManagementCouncil>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: ManagementCouncil) => this.edit(item),
      show: (_item: ManagementCouncil) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: ManagementCouncil) => this.delete(item),
      show: (_item: ManagementCouncil) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: ManagementCouncil) => this.view(item),
    }
  ];
  sortingCallbacks = {
    nationality: (a: ManagementCouncil, b: ManagementCouncil, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.nationalityInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.nationalityInfo.getName().toLowerCase();
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
      new ManagementCouncil().getManagementCouncilFields(true)
    );
  }

  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.viewOnly = false;
      this.changed$.next(new ManagementCouncil());
    });
  }

  private listenToChange() {
    this.changed$.pipe(takeUntil(this.destroy$)).subscribe((record) => {
      this.current = record || undefined;
      this.updateForm(this.current);
    });
  }

  _getPopupComponent() {
    return ManagementCouncilPopupComponent;
  }
  openFormDialog() {
    this.dialogService.show(this._getPopupComponent(), {
      viewOnly: this.viewOnly,
      readonly: this.readonly,
      form: this.form,
      editItem: this.editItem,
      model: this.current,
      nationalities: this.nationalities
    }).onAfterClose$.subscribe((data) => {
      if (data) {
        this.save(data)
      } else {
        this.cancel()
      }
    })
  }
  private updateForm(record: ManagementCouncil | undefined) {
    if (record) {
      if (this.viewOnly) {
        this._setComponentReadiness('READY');
      } else {
        this._setComponentReadiness('NOT_READY');
      }
      this.openFormDialog();
      if (this.readonly || this.viewOnly) {
        this.form.disable();
      } else {
        this.form.enable()
      }
    } else {
      this._setComponentReadiness('READY');
    }
  }

  save(model: ManagementCouncil) {
    if (this.readonly || this.viewOnly) {
      return;
    }
    this.save$.next(model);
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
            this.openFormDialog();
          }
          return !isDuplicate;
        })
      )
      .subscribe((record: ManagementCouncil) => {
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
    record: ManagementCouncil | null,
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

  edit(record: ManagementCouncil, $event?: MouseEvent) {
    $event?.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editItem = record;
    this.viewOnly = false;
    this.changed$.next(record);
  }

  view(record: ManagementCouncil, $event?: MouseEvent) {
    $event?.preventDefault();
    this.editItem = record;
    this.viewOnly = true;
    this.changed$.next(record);
  }

  delete(record: ManagementCouncil, $event?: MouseEvent): any {
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
