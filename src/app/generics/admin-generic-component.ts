import {BehaviorSubject, of, Subject} from "rxjs";
import {IMenuItem} from "@app/modules/context-menu/interfaces/i-menu-item";
import {catchError, exhaustMap, filter, switchMap, takeUntil} from "rxjs/operators";
import {Directive, OnDestroy, OnInit} from "@angular/core";
import {FormControl} from "@angular/forms";
import {BackendWithDialogOperationsGenericService} from "@app/generics/backend-with-dialog-operations-generic-service";
import {DialogRef} from "@app/shared/models/dialog-ref";

@Directive()
export abstract class AdminGenericComponent<M extends { id: number }, S extends BackendWithDialogOperationsGenericService<M>> implements OnInit, OnDestroy {
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
  filterControl: FormControl = new FormControl('');
  // main service that will serve component needs.
  abstract service: S;
  // grid actions override it if you need to add context-menu on your grid
  abstract actions: IMenuItem<M>[] = [];
  // grid columns override it in your component to display your custom columns on your grid
  abstract displayedColumns: string[] = [];
  //  you can override this property from child class to use load or loadComposite
  useCompositeToLoad: boolean = true;

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
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
        const load = this.useCompositeToLoad ? this.service.loadComposite() : this.service.load();
        return load.pipe(catchError(_ => of([])));
      }))
      .subscribe((list: M[]) => {
        this.models = list;
      })
  }

  /**
   * @description listen to add - default implementation you can override it in Child class if you need
   */
  listenToAdd(): void {
    this.add$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap(() => this.service.addDialog().onAfterClose$))
      .subscribe(() => this.reload$.next(null))
  }

  /**
   * @description listen to edit - default implementation you can override it in Child class if you need
   */
  listenToEdit(): void {
    this.edit$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
          return (this.useCompositeToLoad ?
            this.service.editDialogComposite(model).pipe(catchError(_ => of(null))) :
            this.service.editDialog(model).pipe(catchError(_ => of(null))))
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null))
  }
}
