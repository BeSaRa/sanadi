import { Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Cloneable } from '@app/models/cloneable';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({})
export abstract class ListModelComponent<T extends Cloneable<T>>
  implements OnInit, OnDestroy {
  _list: T[] = [];
  model!: T;
  form!: UntypedFormGroup;
  showForm = false;
  editRecordIndex = -1;
  add$: Subject<null> = new Subject<null>();
  save$: Subject<T> = new Subject<T>();
  private destroy$: Subject<any> = new Subject<any>();
  constructor(private TCreator: new () => T) {
    this.model = new this.TCreator();
  }
  get list(): T[] {
    return this._list;
  }
  ngOnInit(): void {
    this.listenToAdd();
    this.listenToModelChange();
    this._initComponent();
  }
  protected abstract _initComponent(): void;
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
  listenToAdd(): void {
    this.add$.pipe(takeUntil(this.destroy$)).subscribe((_) => {
      this.showForm = true;
    });
  }
  listenToModelChange(): void {
    this.save$.pipe(takeUntil(this.destroy$)).subscribe((model) => {
      this.model = model;
      console.log(model)
      this._list = [...this._list, this.model];
      this.showForm = false;
    });
  }
  save(): void {
    const value = this.form.value;
    const model = new this.TCreator().clone({
      ...value,
    });
    this.save$.next(model);
  }
  cancel(): void {
    this.form.reset();
    this.showForm = false;
  }
}
