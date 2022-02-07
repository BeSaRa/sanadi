import {Component, Inject} from '@angular/core';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {SDGoal} from '@app/models/sdgoal';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {FormBuilder, FormGroup} from '@angular/forms';
import {BehaviorSubject, isObservable, Observable, of, Subject} from 'rxjs';
import {FormManager} from '@app/models/form-manager';
import {LangService} from '@app/services/lang.service';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {Lookup} from '@app/models/lookup';
import {LookupService} from '@app/services/lookup.service';
import {catchError, exhaustMap, filter, switchMap, takeUntil} from 'rxjs/operators';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';

@Component({
  selector: 'sd-goal-popup',
  templateUrl: './sd-goal-popup.component.html',
  styleUrls: ['./sd-goal-popup.component.scss']
})
export class SdGoalPopupComponent extends AdminGenericDialog<SDGoal> {
  form!: FormGroup;
  fm!: FormManager;
  model!: SDGoal;
  operation!: OperationTypes;
  tabsData: IKeyValue = {
    basic: {name: 'basic'},
    subGoals: {name: 'subGoals'}
  };
  validToAddSubGoals = false;
  statuses: Lookup[] = this.lookupService.listByCategory.CommonStatus;
  destroy$: Subject<void> = new Subject<void>();
  reloadSubGoals$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  addSubSdGoal$: Subject<any> = new Subject<any>();
  editSubSdGoal$: Subject<SDGoal> = new Subject<SDGoal>();
  saveSubSdGoal$: Subject<any> = new Subject<any>();
  subGoals: SDGoal[] = [];
  subGoalsColumns = ['arName', 'enName', 'status', 'actions'];
  parentId: number;
  commonStatusEnum = CommonStatusEnum;

  sortingCallbacks = {
    statusInfo: (a: SDGoal, b: SDGoal, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

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

  get popupTitle(): string {
    return this.operation === OperationTypes.CREATE ? this.lang.map.lbl_add_sd_goal : this.lang.map.lbl_edit_sd_goal;
  };

  initPopup(): void {
    this.listenToReloadSubGoals();
    this.listenToAddSubSdGoal();
    this.listenToEditSubSdGoal();
    this.listenToSaveSubSdGoal();
  }

  listenToReloadSubGoals() {
    this.reloadSubGoals$
      .pipe(takeUntil(this.destroy$),
        exhaustMap(() => {
          return this.operation == OperationTypes.UPDATE ? this.model.loadSubGoals() : of([]);
        }))
      .subscribe((list: SDGoal[]) => {
        this.subGoals = list;
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
    this.fm = new FormManager(this.form, this.lang);
  }

  edit(sdGoal: SDGoal, event: MouseEvent) {
    event.preventDefault();
    this.editSubSdGoal$.next(sdGoal);
  }

  delete(event: MouseEvent, model: SDGoal): void {
    event.preventDefault();
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
