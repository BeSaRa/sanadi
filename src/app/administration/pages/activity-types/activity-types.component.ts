import { Component, EventEmitter, Output } from '@angular/core';
import { AdminLookupTypeEnum } from '@app/enums/admin-lookup-type-enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { AdminLookup } from '@app/models/admin-lookup';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { ActivityTypeService } from '@app/services/activity-type.service';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { of, Subject } from 'rxjs';
import {
  catchError,
  filter,
  exhaustMap,
  switchMap,
  takeUntil,
} from 'rxjs/operators';

@Component({
  selector: 'activity-types',
  templateUrl: './activity-types.component.html',
  styleUrls: ['./activity-types.component.scss'],
})
export class ActivityTypeComponent extends AdminGenericComponent<
  AdminLookup,
  ActivityTypeService
> {
  actions: IMenuItem<AdminLookup>[] = [];
  displayedColumns: string[] = [
    'arName',
    'enName',
    'status',
    'actions',
  ];
  @Output() onReady: EventEmitter<AdminLookupTypeEnum> = new EventEmitter<AdminLookupTypeEnum>();
  view$ = new Subject<AdminLookup>();

  constructor(
    public service: ActivityTypeService,
    public lang: LangService,
    private dialogService: DialogService,
    private toast: ToastService
  ) {
    super();
  }
  protected _init(): void {
    this.listenToView();
    this.onReady.emit(AdminLookupTypeEnum.ACTIVITY_TYPE);
  }
  listenToEdit(): void {
    this.edit$
      .pipe(
        takeUntil(this.destroy$),
        exhaustMap((model) => this.service.openEditDialog(model))
      )
      .pipe(
        filter((dialog): dialog is DialogRef => !!dialog),
        switchMap((dialog) => dialog.onAfterClose$)
      )
      .subscribe(() => this.reload$.next(null));
  }
  listenToView(): void {
    this.view$
      .pipe(
        takeUntil(this.destroy$),
        exhaustMap((model) => {
          return this.service
            .openViewDialog(model)
            .pipe(catchError((_) => of(null)));
        })
      )
      .pipe(
        filter((dialog): dialog is DialogRef => !!dialog),
        switchMap((dialog) => dialog.onAfterClose$)
      )
      .subscribe(() => this.reload$.next(null));
  }
  view(model: AdminLookup, event: MouseEvent) {
    event.preventDefault();
    this.view$.next(model);
  }
  edit(model: AdminLookup, event: MouseEvent) {
    event.preventDefault();
    this.edit$.next(model);
  }
  delete(event: MouseEvent, model: AdminLookup): void {
    event.preventDefault();
    const message = this.lang.map.msg_confirm_delete_x.change({
      x: model.getName(),
    });
    this.dialogService
      .confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const sub = this.service
            .delete(model.id)
            .subscribe(() => {
              this.toast.success(
                this.lang.map.msg_delete_x_success.change({
                  x: model.getName(),
                })
              );
              this.reload$.next(null);
              sub.unsubscribe();
            });
        }
      });
  }
}
