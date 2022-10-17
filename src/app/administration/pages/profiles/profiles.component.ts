import { Component, OnInit } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
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
  actions: IMenuItem<Profile>[] = [
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item: Profile) => this.edit$.next(item)
    },
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item: Profile) => this.view$.next(item)
    },
    {

      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_activate',
      onClick: (item: Profile) => this.toggleStatus(item),
      displayInGrid: false,
      show: (item) => {
        return item.status !== CommonStatusEnum.RETIRED && item.status === CommonStatusEnum.DEACTIVATED;
      }
    }
  ];
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
            .openViewDialog(model.id)
            .pipe(catchError((_) => of(null)));
        })
      )
      .pipe(
        filter((dialog): dialog is DialogRef => !!dialog),
        switchMap((dialog) => dialog.onAfterClose$)
      )
      .subscribe(() => this.reload$.next(null));
  }
  public toggleStatus(model: Profile): void {
    model.updateStatus(model.id, model.status).subscribe(() => {
      this.reload$.next(null);
    })

  }


}
