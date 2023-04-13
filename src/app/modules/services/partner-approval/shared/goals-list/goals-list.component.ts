import { OnDestroy } from '@angular/core';
import { GoalList } from '@models/goal-list';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActionIconsEnum } from '@enums/action-icons-enum';
import { UserClickOn } from '@enums/user-click-on.enum';
import { CommonUtils } from '@helpers/common-utils';
import { SortEvent } from '@contracts/sort-event';
import { AdminLookup } from '@models/admin-lookup';
import { AdminResult } from '@models/admin-result';
import { IMenuItem } from '@modules/context-menu/interfaces/i-menu-item';
import { DialogService } from '@services/dialog.service';
import { LangService } from '@services/lang.service';
import { ToastService } from '@services/toast.service';
import { ReadinessStatus } from '@app/types/types';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, take, takeUntil, tap } from 'rxjs/operators';
import { GoalsListPopupComponent } from './goals-list-popup/goals-list-popup.component';

@Component({
  selector: 'goals-list',
  templateUrl: './goals-list.component.html',
  styleUrls: ['./goals-list.component.css']
})
export class GoalsListComponent implements OnInit, OnDestroy {

  constructor(
    public lang: LangService,
    private toastService: ToastService,
    private dialogService: DialogService,
    private fb: UntypedFormBuilder
  ) { }

  @Input() readonly: boolean = false;
  private _list: GoalList[] = [];

  @Input() set list(list: GoalList[]) {
    this._list = list;
    this.dataSource.next(this._list);
  }
  @Input() goal?: string = undefined;
  get list(): GoalList[] {
    return this._list;
  }

  filterControl: UntypedFormControl = new UntypedFormControl('');

  @Output() readyEvent = new EventEmitter<ReadinessStatus>();

  dataSource: BehaviorSubject<GoalList[]> = new BehaviorSubject<GoalList[]>([]);
  columns = ['domain', 'mainDACCategory', 'mainUNOCHACategory', 'actions'];

  editItem?: GoalList;
  add$: Subject<any> = new Subject<any>();
  viewOnly: boolean = false;

  private save$: Subject<any> = new Subject<any>();

  private recordChanged$: Subject<GoalList | null> = new Subject<GoalList | null>();
  private current?: GoalList;
  private destroy$: Subject<any> = new Subject<any>();

  mainDACCategoryInfo: AdminLookup[] = [];
  mainUNOCHACategoryInfo: AdminLookup[] = [];
  domainInfo: AdminLookup[] = [];
  form!: UntypedFormGroup;

  ngOnInit(): void {
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
    const goalList = new GoalList();
    this.form = this.fb.group(goalList.buildForm(true));
  }
  actions: IMenuItem<GoalList>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: GoalList) => this.edit(item),
      show: (_item: GoalList) => !this.readonly,
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: GoalList) => this.delete(item),
      show: (_item: GoalList) => !this.readonly,
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: GoalList) => this.view(item),
    },
  ];
  sortingCallbacks = {
    domain: (a: GoalList, b: GoalList, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a)
        ? ''
        : a.domainInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b)
          ? ''
          : b.domainInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    dac: (a: GoalList, b: GoalList, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a)
        ? ''
        : a.mainDACCategoryInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b)
          ? ''
          : b.mainDACCategoryInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    unocha: (a: GoalList, b: GoalList, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a)
        ? ''
        : a.mainUNOCHACategoryInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b)
          ? ''
          : b.mainUNOCHACategoryInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
  };
  addAllowed(): boolean {
    return !this.readonly;
  }

  _getPopupComponent() {
    return GoalsListPopupComponent;
  }
  openFormDialog() {
    this.dialogService.show(this._getPopupComponent(), {
      viewOnly: this.viewOnly,
      readonly: this.readonly,
      form: this.form,
      editItem: this.editItem,
      model: this.current
    }).onAfterClose$.subscribe((data) => {
      if (data) {
        this.save(data)
      } else {
        this.cancel()
      }
    })
  }
  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.viewOnly = false;
      this.recordChanged$.next(new GoalList());
    });
  }

  private listenToChange() {
    this.recordChanged$.pipe(takeUntil(this.destroy$)).subscribe((goalList) => {
      this.current = goalList || undefined;
      this.updateForm(this.current);
    });
  }

  private updateForm(record: GoalList | undefined) {
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
        this.form.enable();
      }
    } else {
      this._setComponentReadiness('READY');
    }
  }

  save(model: GoalList) {
    if (this.readonly || this.viewOnly) {
      return;
    }
    this.save$.next(model);
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
          const isDuplicate = this.list.some(
            (x) =>
              (x.mainDACCategory === formValue.mainDACCategory) &&
              (x.mainUNOCHACategory === formValue.mainUNOCHACategory)
          );
          if (isDuplicate) {
            this.toastService.alert(this.lang.map.msg_duplicated_item);
            this.openFormDialog();
          }
          return !isDuplicate;
        })
      )
      .subscribe((goalList: GoalList) => {
        if (!goalList) {
          return;
        }
        this._updateList(goalList, !!this.editItem ? 'UPDATE' : 'ADD');
        this.toastService.success(this.lang.map.msg_save_success);
        this.recordChanged$.next(null);
        this.cancel();
      });

  }
  private displayRequiredFieldsMessage(): void {
    this.dialogService
      .error(this.lang.map.msg_all_required_fields_are_filled)
      .onAfterClose$.pipe(take(1))
      .subscribe(() => {
        this.form.markAllAsTouched();
      });
  }
  private _updateList(
    record: GoalList | null,
    operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE'
  ) {
    if (record) {
      if (operation === 'ADD') {
        this.list.push(record);
      } else {
        let index = !this.editItem
          ? -1
          : this.list.findIndex((x) => x === this.editItem);
        if (operation === 'UPDATE') {
          this.list.splice(index, 1, record);
        } else if (operation === 'DELETE') {
          this.list.splice(index, 1);
        }
      }
    }
    this.list = this.list.slice();

  }

  edit(record: GoalList, $event?: MouseEvent) {
    $event?.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editItem = record;
    this.viewOnly = false;
    this.recordChanged$.next(record);
  }

  view(record: GoalList, $event?: MouseEvent) {
    $event?.preventDefault();
    this.editItem = record;
    this.viewOnly = true;
    this.recordChanged$.next(record);
  }

  delete(record: GoalList, $event?: MouseEvent): any {
    $event?.preventDefault();
    if (this.readonly) {
      return;
    }
    this.dialogService
      .confirm(this.lang.map.msg_confirm_delete_selected)
      .onAfterClose$.pipe(take(1))
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
    this.viewOnly = false;
    this.editItem = undefined;
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

  trackBy(item: AdminResult) {
    return item.id;
  }

}
