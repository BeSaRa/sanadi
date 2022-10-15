import { BehaviorSubject, Observable, of, Subject } from "rxjs";
import { IMenuItem } from "@app/modules/context-menu/interfaces/i-menu-item";
import { catchError, exhaustMap, filter, map, switchMap, takeUntil } from "rxjs/operators";
import { Directive, OnDestroy, OnInit } from "@angular/core";
import { UntypedFormControl } from "@angular/forms";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { PageEvent } from "@contracts/page-event";
import { CrudServiceInterface } from "@contracts/crud-service-interface";
import {PermissionsEnum} from '@app/enums/permissions-enum';

@Directive()
export abstract class AdminGenericComponent<M extends { id: number }, S extends CrudWithDialogGenericService<M>> implements OnInit, OnDestroy {
  // behavior subject for load the list
  reload$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  // subject for emit clicking on add button
  add$: Subject<any> = new Subject<any>();
  // subject for emit clicking on edit button
  edit$: Subject<M> = new Subject<M>();
  // using this subject later to unsubscribe from any subscription
  destroy$: Subject<any> = new Subject<any>();
  // list fo models related to the entity
  models: M[] = [];
  // to filter grid models based on what the user type here
  filterControl: UntypedFormControl = new UntypedFormControl('');
  // main service that will serve component needs.
  abstract service: S;
  // grid actions override it if you need to add context-menu on your grid
  abstract actions: IMenuItem<M>[];
  // grid columns override it in your component to display your custom columns on your grid
  abstract displayedColumns: string[];
  //  you can override this property from child class to use load or loadComposite
  useCompositeToLoad: boolean = true;
  //  you can override this property from child class to use editDialog or editDialogComposite
  useCompositeToEdit: boolean = true;
  // common status enum
  commonStatusEnum = CommonStatusEnum;
  // permissions enum
  permissionsEnum = PermissionsEnum;

  usePagination: boolean = false;
  count: number = 0;

  pageEvent: PageEvent = {
    pageIndex: 0,
    pageSize: 10,
    length: 0,
    previousPageIndex: null
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this._init();
    this.listenToReload();
    this.listenToAdd();
    this.listenToEdit();
  }

  /**
   * @description listen to reload - default implementation you can override it in child Class if you need.
   */
  listenToReload() {
    this.reload$
      .pipe(takeUntil((this.destroy$)))
      .pipe(switchMap(() => {
        let load: Observable<M[]>
        let service = this.service as unknown as CrudServiceInterface<M>
        const paginationOptions = {
          limit: this.pageEvent.pageSize,
          offset: (this.pageEvent.pageIndex * this.pageEvent.pageSize)
        }
        if (this.usePagination) {
          load = (this.useCompositeToLoad ? service.paginateComposite(paginationOptions) : service.paginate(paginationOptions))
            .pipe(map((res) => {
              this.count = res.count;
              return res.rs;
            }))
        } else {
          load = this.useCompositeToLoad ? this.service.loadComposite() : this.service.load();
        }
        return load.pipe(catchError(_ => {
          console.log('Error', _);
          return of([])
        }));
      }))
      .subscribe((list: M[]) => {
        /*if (this.filterRetired) {
          list = list.filter((item) => {
            const model = item as M & { status: number }
            return model.status !== CommonStatusEnum.RETIRED
          })
        }*/
        if (!this.usePagination) {
          this.count = list.length;
        }
        this.models = list;
        this.afterReload();
      })
  }

  /**
   * @description listen to add - default implementation you can override it in Child class if you need
   */
  listenToAdd(): void {
    this.add$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap(() => {
        const result = this.service.addDialog();
        if (result instanceof DialogRef) {
          return result.onAfterClose$;
        } else {
          return result.pipe(switchMap(ref => ref.onAfterClose$));
        }
      }))
      .subscribe(() => this.reload$.next(null))
  }

  /**
   * @description listen to edit - default implementation you can override it in Child class if you need
   */
  listenToEdit(): void {
    this.edit$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return (this.useCompositeToEdit ?
          this.service.editDialogComposite(model).pipe(catchError(_ => {
            console.log(_);
            return of(null)
          })) :
          this.service.editDialog(model).pipe(catchError(_ => {
            console.log(_);
            return of(null)
          })))
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null))
  }

  protected _init(): void {

  }

  afterReload(): void {

  }

  pageChange($event: PageEvent): void {
    this.pageEvent = $event
    if (this.usePagination && this.pageEvent.previousPageIndex !== null) {
      this.reload$.next(this.reload$.value)
    }
  }

}
