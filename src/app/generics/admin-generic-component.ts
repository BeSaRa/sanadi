import {BehaviorSubject, of, Subject} from "rxjs";
import {IMenuItem} from "@app/modules/context-menu/interfaces/i-menu-item";
import {catchError, exhaustMap, switchMap, takeUntil} from "rxjs/operators";
import {Directive, OnDestroy, OnInit} from "@angular/core";
import {FormControl} from "@angular/forms";
import {BackendWithDialogOperationsGenericService} from "@app/generics/backend-with-dialog-operations-generic-service";

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
        return this.service.loadComposite().pipe(catchError(_ => of([])));
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
      .pipe(exhaustMap(() => of(this.service.addDialog())))
      .subscribe()
  }

  /**
   * @description listen to edit - default implementation you can override it in Child class if you need
   */
  listenToEdit(): void {
    this.edit$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.service.editDialog(model).pipe(catchError(_ => of(null)))
      }))
      .subscribe()
  }
}
