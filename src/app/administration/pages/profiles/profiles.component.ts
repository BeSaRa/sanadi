import { Component, OnInit } from '@angular/core';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { Profile } from '@app/models/profile';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { LangService } from '@app/services/lang.service';
import { ProfileService } from '@app/services/profile.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { Observable, of, Subject } from 'rxjs';
import { catchError, exhaustMap, filter, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.scss']
})
export class ProfilesComponent extends AdminGenericComponent<Profile, ProfileService> {
  actions: IMenuItem<Profile>[] = [];
  displayedColumns: string[] = ['arName', 'enName', 'status', 'actions'];
  view$: Subject<Profile> = new Subject<Profile>();
  constructor(public service: ProfileService, public lang: LangService, private toast: ToastService) {
    super();
  }
  protected _init(): void {
    this.listenToView();
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
  public view(row: Profile, event: MouseEvent): void {
    event.preventDefault();
    this.view$.next(row);
  }
  public edit(row: Profile, event: MouseEvent): void {
    event.preventDefault();
    this.edit$.next(row);
  }
  public toggleStatus(model: Profile): void {
    let observable: Observable<Object>;
    if (model.status === 1) {
      observable = this.service.deActivate(model.id);
    }
    else {
      observable = this.service.activate(model.id);
    }
    observable.subscribe(e => {
      this.reload$.next(null);
    });

  }


}
