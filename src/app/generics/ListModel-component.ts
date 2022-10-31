import { Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { Cloneable } from '@app/models/cloneable';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { DialogService } from '@app/services/dialog.service';
import { FactoryService } from '@app/services/factory.service';
import { LangService } from '@app/services/lang.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({})
export abstract class ListModelComponent<T extends Cloneable<T>>
  implements OnInit, OnDestroy {
  public lang: LangService = FactoryService.getService('LangService');
  public dialogService: DialogService = FactoryService.getService('DialogService');
  _list: T[] = [];
  model!: T;
  form!: UntypedFormGroup;
  public readonly = false;
  showForm = false;
  editRecordIndex = -1;
  add$: Subject<null> = new Subject<null>();
  save$: Subject<T> = new Subject<T>();
  show$: Subject<T> = new Subject<T>();
  private destroy$: Subject<any> = new Subject<any>();
  actions: IMenuItem<T>[] = [
    {
      type: 'action',
      disabled: () => this.readonly,
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (e) => this.removeOne(e)
    },
    {

      type: 'action',
      disabled: () => this.readonly,
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (e) => this.selectOne(e)
    },
    {

      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (e) => this.selectOne(e, true)
    }
  ];
  hideSave = false;
  constructor(private TCreator: new () => T) {
    this.model = new this.TCreator();
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
      this.model = new this.TCreator();
    });
  }
  _beforeAdd(model: T): T | null {
    return model;
  }
  listenToModelChange(): void {
    this.save$.pipe(takeUntil(this.destroy$)).subscribe((model) => {
      const _model = this._beforeAdd(model);
      if (!_model) {
        return;
      }
      this.model = _model;
      if (this.editRecordIndex === -1) {
        this._list = [...this._list, this.model];
      }
      else {
        this._list[this.editRecordIndex] = this.model;
        this._list = [...this._list];
        this.editRecordIndex = -1;
      }
      this.cancel();
    });
  }
  save(): void {
    const value = this.form.value;
    const model = new this.TCreator().clone({
      ...value,
    });
    this.save$.next(model);
  }
  cancel(model: T | null = null): void {
    this.form.reset();
    this.showForm = false;
    this.hideSave = false;
  }
  selectOne(row: T, viewOnly = false) {
    this.hideSave = viewOnly;
    const index = this._list.findIndex(e => e === row);
    this.model = this._list[index];
    this.editRecordIndex = index;
    this.showForm = true;
    this._selectOne(row);
  }
  _selectOne(row: T) {
    this.form.patchValue(row);
  }
  removeOne(row: T) {
    const index = this._list.findIndex(e => e === row);
    const message = this.lang.map.msg_confirm_delete_selected;
    this.dialogService.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          this._list = this._list.filter((_, idx) => idx !== index);

        }
      });
  }
}
