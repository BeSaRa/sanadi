import { Component } from '@angular/core';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { VacationDates } from '@app/models/vacation-dates';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { VacationDatesService } from '@app/services/vacation-dates.service';
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
  selector: 'vaction-dates',
  templateUrl: './vaction-dates.component.html',
  styleUrls: ['./vaction-dates.component.scss'],
})
export class VactionDatesComponent extends AdminGenericComponent<
VacationDates,
VacationDatesService
> {
  actions: IMenuItem<VacationDates>[] = [];
  displayedColumns: string[] = [
    'rowSelection',
    'arName',
    'enName',
    'vacationDateFrom',
    'vacationDateTo',
    'actions',
  ];
  view$ = new Subject<VacationDates>();

  constructor(
    public service: VacationDatesService,
    public lang: LangService,
    private dialogService: DialogService,
    private toast: ToastService
  ) {
    super();
  }
  protected _init(): void {
    this.listenToView();
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
  view(model: VacationDates, event: MouseEvent) {
    event.preventDefault();
    this.view$.next(model);
  }
  edit(model: VacationDates, event: MouseEvent) {
    event.preventDefault();
    this.edit$.next(model);
  }
  delete(event: MouseEvent, model: VacationDates): void {
    event.preventDefault();
    const message = this.lang.map.msg_confirm_delete_x.change({
      x: model.getName(),
    });
    this.dialogService
      .confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const sub = this.service
            .deleteByPeriodId(model.periodId)
            .subscribe(() => {
              // @ts-ignore
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
