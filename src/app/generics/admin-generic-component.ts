import {BehaviorSubject, Subject} from "rxjs";
import {IMenuItem} from "@app/modules/context-menu/interfaces/i-menu-item";
import {switchMap, takeUntil} from "rxjs/operators";
import {Directive, OnInit} from "@angular/core";
import {OnDestroy} from "@angular/core";
import {FormControl} from "@angular/forms";
import {BackendGenericService} from "@app/generics/backend-generic-service";

@Directive()
export abstract class AdminGenericComponent<M, S extends BackendGenericService<M>> implements OnInit, OnDestroy {
  // behavior subject for load the list
  reload$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  // subject for emit clicking on add button
  add$: Subject<any> = new Subject<any>();
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
    console.log('Destroy');
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.listenToReload();
  }

  /**
   * @description listen to reload - default implementation we can override it on child Class
   */
  listenToReload() {
    this.reload$
      .pipe(takeUntil((this.destroy$)))
      .pipe(switchMap(() => this.service.loadComposite()))
      .subscribe((list: M[]) => {
        this.models = list;
      })
  }
}
