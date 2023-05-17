import {AfterViewInit, Directive, inject, Input, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '@services/lang.service';
import {IMenuItem} from '@modules/context-menu/interfaces/i-menu-item';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {UntypedFormControl} from '@angular/forms';
import {exhaustMap, filter, switchMap, takeUntil, tap} from 'rxjs/operators';
import {ComponentType} from '@angular/cdk/portal';
import {DialogService} from '@services/dialog.service';
import {IDialogData} from '@contracts/i-dialog-data';
import {OperationTypes} from '@enums/operation-types.enum';
import {CaseTypes} from '@enums/case-types.enum';
import {UserClickOn} from '@enums/user-click-on.enum';
import {IKeyValue} from '@contracts/i-key-value';
import {ToastService} from '@services/toast.service';
import {CustomValidators} from "@app/validators/custom-validators";

@Directive()
export abstract class UiCrudListGenericComponent<M> implements OnInit, AfterViewInit, OnDestroy {
  @Input() list: M[] = [];
  @Input() caseType?: CaseTypes;
  @Input() readonly: boolean = false;

  lang = inject(LangService);
  toast = inject(ToastService);
  dialog = inject(DialogService);

  abstract actions: IMenuItem<M>[];
  abstract displayColumns: string[];

  abstract _getNewInstance(override?: Partial<M>): M;

  abstract _getDialogComponent(): ComponentType<any>;

  abstract _getDeleteConfirmMessage(record: M): string;

  abstract getExtraDataForPopup(): IKeyValue;

  /**
   * @description Reloads the list after updating the original list according to operation passed.
   */
  reload$: BehaviorSubject<{ operation: OperationTypes, savedRecord?: M }> =
    new BehaviorSubject<{ operation: OperationTypes, savedRecord?: M }>({operation: OperationTypes.VIEW});
  add$: Subject<any> = new Subject<any>();
  // subject for emit clicking on edit button
  edit$: Subject<M> = new Subject<M>();
  // subject for emit clicking on view button
  view$: Subject<M> = new Subject<M>();
  confirmDelete$: Subject<M> = new Subject<M>();
  // using this subject later to unsubscribe from any subscription
  destroy$: Subject<any> = new Subject<any>();
  filterControl: UntypedFormControl = new UntypedFormControl('');
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  sortingCallbacks = {};
  itemInOperation?: M;
  itemInOperationListIndex?: number;

  ngOnInit(): void {
    this._init();
    this.listenToReload();
    this.listenToAdd();
    this.listenToEdit();
    this.listenToView();
    this.listenToConfirmDelete();
  }

  protected _init(): void {

  }

  ngAfterViewInit(): void {
    Promise.resolve().then(() => {
      this._afterViewInit();
    })
  }

  protected _afterViewInit(): void {

  }

  afterReload(): void {

  }

  private _itemInOperationIndex(): number {
    return !this.itemInOperation ? -1 : this.list.findIndex(x => x === this.itemInOperation);
  }

  private _updateList(operation: OperationTypes, addedOrUpdatedRecord?: M) {
    const itemInOperationIndex = this._itemInOperationIndex();
    if (operation === OperationTypes.DELETE) {
      itemInOperationIndex > -1 ? this.list.splice(itemInOperationIndex, 1) : null;
    } else {
      if (addedOrUpdatedRecord) {
        if (operation === OperationTypes.CREATE) {
          this.list.push(addedOrUpdatedRecord);
        } else if (operation === OperationTypes.UPDATE) {
          itemInOperationIndex > -1 ? this.list.splice(itemInOperationIndex, 1, addedOrUpdatedRecord) : null;
        }
      }
    }
    this.list = this.list.slice();
  }

  listenToReload(): void {
    this.reload$
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this._updateList(result.operation, result.savedRecord);
        this.itemInOperation = undefined;
        this.itemInOperationListIndex = undefined;
        this.afterReload();
      })
  }

  listenToAdd(): void {
    this.add$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(() => this.itemInOperation = undefined))
      .pipe(exhaustMap(() => {
        return this.dialog.show<IDialogData<M>>(this._getDialogComponent(), {
          model: this._getNewInstance(),
          operation: OperationTypes.CREATE,
          list: this.list,
          caseType: this.caseType,
          listIndex: undefined,
          extras: this.getExtraDataForPopup()
        }).onAfterClose$;
      }))
      .pipe(switchMap((savedRecord: M) => {
        return this.onClosePopup(savedRecord);
      }))
      .subscribe((savedRecord: M) => {
        if (!savedRecord) {
          return;
        }
        this.reload$.next({operation: OperationTypes.CREATE, savedRecord: savedRecord});
      })
  }

  listenToEdit(): void {
    this.edit$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap((model) => this.itemInOperation = model))
      .pipe(exhaustMap((model) => {
        return this.dialog.show<IDialogData<M>>(this._getDialogComponent(), {
          model: this._getNewInstance(model),
          operation: OperationTypes.UPDATE,
          list: this.list,
          caseType: this.caseType,
          listIndex: this._itemInOperationIndex(),
          extras: this.getExtraDataForPopup()
        }).onAfterClose$;
      }))
      .pipe(switchMap((savedRecord: M) => {
        return this.onClosePopup(savedRecord);
      }))
      .subscribe((savedRecord: M) => {
        if (!savedRecord) {
          return;
        }
        this.reload$.next({operation: OperationTypes.UPDATE, savedRecord: savedRecord});
      })
  }

  listenToView(): void {
    this.view$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap((model) => this.itemInOperation = model))
      .pipe(exhaustMap((model) => {
        return this.dialog.show<IDialogData<M>>(this._getDialogComponent(), {
          model: this._getNewInstance(model),
          operation: OperationTypes.VIEW,
          list: this.list,
          caseType: this.caseType,
          listIndex: this._itemInOperationIndex(),
          extras: this.getExtraDataForPopup()
        }).onAfterClose$;
      }))
      .subscribe()
  }

  listenToConfirmDelete(): void {
    this.confirmDelete$
      .pipe(takeUntil(this.destroy$))
      .pipe(filter(() => !this.readonly))
      .pipe(exhaustMap((model) => {
        return this.dialog.confirm(this._getDeleteConfirmMessage(model)).onAfterClose$
          .pipe(tap((userSelection) => {
            this.itemInOperation = undefined;
            this.itemInOperationListIndex = undefined;
            if (userSelection === UserClickOn.YES) {
              this.itemInOperation = model;
              this.itemInOperationListIndex = this._itemInOperationIndex();
            }
          }));
      }))
      .subscribe((userSelection: UserClickOn) => {
        if (userSelection === UserClickOn.YES) {
          this.toast.success(this.lang.map.msg_deleted_in_list_success);
          this.reload$.next({operation: OperationTypes.DELETE});
        }
      })
  }

  onClosePopup(savedRecord: M): Observable<M> {
    return of(savedRecord)
  }

  forceClearComponent() {
    this.list = [];
    this.reload$.next({operation: OperationTypes.VIEW});
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
