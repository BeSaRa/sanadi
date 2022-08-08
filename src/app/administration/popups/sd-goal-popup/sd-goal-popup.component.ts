import {Component, Inject, ViewChild} from '@angular/core';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {SDGoal} from '@app/models/sdgoal';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {BehaviorSubject, isObservable, Observable, of, Subject} from 'rxjs';
import {LangService} from '@app/services/lang.service';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {Lookup} from '@app/models/lookup';
import {LookupService} from '@app/services/lookup.service';
import {catchError, exhaustMap, filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';
import {PageEvent} from '@contracts/page-event';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {TableComponent} from '@app/shared/components/table/table.component';

@Component({
  selector: 'sd-goal-popup',
  templateUrl: './sd-goal-popup.component.html',
  styleUrls: ['./sd-goal-popup.component.scss']
})
export class SdGoalPopupComponent extends AdminGenericDialog<SDGoal> {

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<SDGoal>,
              public fb: FormBuilder,
              public dialogRef: DialogRef,
              public lang: LangService,
              private lookupService: LookupService,
              private dialogService: DialogService,
              private toast: ToastService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    this.parentId = data.parentId;
  }

  form!: FormGroup;
  model!: SDGoal;
  operation!: OperationTypes;
  tabsData: IKeyValue = {
    basic: {name: 'basic'},
    subGoals: {name: 'subGoals'}
  };
  validToAddSubGoals = false;
  statuses: Lookup[] = this.lookupService.listByCategory.CommonStatus;
  destroy$: Subject<void> = new Subject<void>();
  filterControl: FormControl = new FormControl('');
  reloadSubGoals$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  addSubSdGoal$: Subject<any> = new Subject<any>();
  editSubSdGoal$: Subject<SDGoal> = new Subject<SDGoal>();
  saveSubSdGoal$: Subject<any> = new Subject<any>();
  subGoals: SDGoal[] = [];
  displayedColumns = ['arName', 'enName', 'status', 'actions'];
  parentId: number;
  commonStatusEnum = CommonStatusEnum;
  @ViewChild('table') table!: TableComponent;

  sortingCallbacks = {
    statusInfo: (a: SDGoal, b: SDGoal, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  actions: IMenuItem<SDGoal>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item: SDGoal) => this.editSubSdGoal$.next(item)
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: SDGoal) => this.delete(item)
    }
  ]

  usePagination: boolean = true;
  count: number = 0;

  pageEvent: PageEvent = {
    pageIndex: 0,
    pageSize: 10,
    length: 0,
    previousPageIndex: null
  }

  get popupTitle(): string {
    if (this.operation === OperationTypes.CREATE){
      return this.lang.map.lbl_add_sd_goal;
    } else if (this.operation === OperationTypes.UPDATE){
      return this.lang.map.lbl_edit_sd_goal
    }
    return this.lang.map.view;
  };

  initPopup(): void {
    this.listenToReloadSubGoals();
    this.listenToAddSubSdGoal();
    this.listenToEditSubSdGoal();
    this.listenToSaveSubSdGoal();
  }

  pageChange($event: PageEvent): void {
    this.pageEvent = $event
    if (this.usePagination && this.pageEvent.previousPageIndex !== null) {
      this.reloadSubGoals$.next(this.reloadSubGoals$.value)
    }
  }

  listenToReloadSubGoals() {
    this.reloadSubGoals$
      .pipe(takeUntil(this.destroy$),
        exhaustMap(() => {
          const paginationOptions = {
            limit: this.pageEvent.pageSize,
            offset: (this.pageEvent.pageIndex * this.pageEvent.pageSize)
          };
          return this.model.loadSubGoalsPaginate(paginationOptions)
            .pipe(map((res) => {
              this.count = res.count;
              return res.rs;
            }));
        }))
      .subscribe((list: SDGoal[]) => {
        this.subGoals = list;
        this.table && this.table.clearSelection();
      });
  }

  listenToAddSubSdGoal(): void {
    this.addSubSdGoal$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap(() => this.model.service.subSdGoalAddDialog(this.model.id).onAfterClose$))
      .subscribe(() => this.reloadSubGoals$.next(null));
  }

  listenToEditSubSdGoal(): void {
    this.editSubSdGoal$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => this.model.service.subSdGoalEditDialog(model, this.model.id).onAfterClose$))
      .subscribe(() => this.reloadSubGoals$.next(null));
  }

  listenToSaveSubSdGoal() {
    this.saveSubSdGoal$
      // call before Save callback
      .pipe(switchMap(() => {
        const result = this.beforeSave(this.model, this.form);
        return isObservable(result) ? result : of(result);
      }))
      // filter the return value from saveBeforeCallback and allow only the true
      .pipe(filter(value => value))
      .pipe(switchMap(_ => {
        const result = this.prepareModel(this.model, this.form);
        return isObservable(result) ? result : of(result);
      }))
      .pipe(exhaustMap((model: SDGoal) => {
        model.parentId = this.parentId;
        return model.save().pipe(catchError(error => {
          this.saveFail(error);
          return of({
            error: error,
            model
          });
        }));
      }))
      .pipe(filter((value) => !value.hasOwnProperty('error')))
      .subscribe((model: SDGoal | any) => {
        this.afterSave(model, this.dialogRef);
      });
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
  }

  delete( model: SDGoal): void {
    // @ts-ignore
    const message = this.lang.map.msg_confirm_delete_x.change({x: model.getName()});
    this.dialogService.confirm(message)
      .onAfterClose$
      .pipe(
        takeUntil(this.destroy$),
        exhaustMap((click: UserClickOn) => {
          return click === UserClickOn.YES ? model.delete() : of(null);
        }))
      .subscribe(() => {
        this.toast.success(this.lang.map.msg_delete_x_success.change({x: model.getName()}));
        this.reloadSubGoals$.next(null);
      });
  }

  prepareModel(model: SDGoal, form: FormGroup): Observable<SDGoal> | SDGoal {
    return (new SDGoal()).clone({...model, ...form.value});
  }

  beforeSave(model: SDGoal, form: FormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  afterSave(model: SDGoal, dialogRef: DialogRef): void {
    this.validToAddSubGoals = true;
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    // @ts-ignore
    this.toast.success(message.change({x: model.getName()}));
    this.model = model;
    const operationBeforeSave = this.operation;
    this.operation = OperationTypes.UPDATE;

    if (operationBeforeSave == OperationTypes.UPDATE || this.parentId) {
      this.dialogRef.close(this.model);
    }
  }

  saveFail(error: Error): void {
  }

  destroyPopup(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
