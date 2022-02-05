import {Component} from '@angular/core';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {InternalUser} from '@app/models/internal-user';
import {LangService} from '@app/services/lang.service';
import {InternalUserService} from '@app/services/internal-user.service';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {Subject} from 'rxjs';
import {exhaustMap, filter, map, mapTo, takeUntil, tap} from 'rxjs/operators';
import {DialogService} from '@app/services/dialog.service';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {ToastService} from '@app/services/toast.service';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';
import {DialogRef} from '@app/shared/models/dialog-ref';

@Component({
  selector: 'internal-user',
  templateUrl: './internal-user.component.html',
  styleUrls: ['./internal-user.component.scss']
})
export class InternalUserComponent extends AdminGenericComponent<InternalUser, InternalUserService> {
  displayedColumns: string[] = ['rowSelection', 'username', 'arName', 'enName', 'defaultDepartment', 'status', 'actions'];
  // subject for emit clicking on delete button
  delete$: Subject<InternalUser> = new Subject<InternalUser>();
  commonStatusEnum = CommonStatusEnum;
  actions: IMenuItem<InternalUser>[] = [
    {
      type: 'action',
      label: 'btn_reload',
      icon: 'mdi-reload',
      onClick: _ => this.reload$.next(null),
    },
    {
      type: 'action',
      label: 'btn_edit',
      icon: 'mdi-account-edit',
      onClick: (user) => this.edit$.next(user)
    },
    // activate
    {
      type: 'action',
      icon: 'mdi-list-status',
      label: 'btn_activate',
      onClick: (item) => this.activateInternalUser(item),
      show: (item) => {
        return item.status === CommonStatusEnum.DEACTIVATED;
      }
    },
    // deactivate
    {
      type: 'action',
      icon: 'mdi-list-status',
      label: 'btn_deactivate',
      onClick: (item) => this.deactivateInternalUser(item),
      show: (item) => {
        return item.status === CommonStatusEnum.ACTIVATED;
      }
    }
  ];

  constructor(public lang: LangService,
              private dialog: DialogService,
              private toast: ToastService,
              public service: InternalUserService) {
    super();
  }

  protected _init() {
    this.listenToDelete();
  }

  sortingCallbacks = {
    statusInfo: (a: InternalUser, b: InternalUser, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    defaultDepartmentInfo: (a: InternalUser, b: InternalUser, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.defaultDepartmentInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.defaultDepartmentInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    username: (a: InternalUser, b: InternalUser, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.domainName.toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.domainName.toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  };

  listenToDelete() {
    this.delete$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.dialog.confirm(this.lang.map.msg_confirm_delete_x.change({x: model.getName()}))
          .onAfterClose$
          .pipe(map((click: UserClickOn) => {
            return {model, click};
          }));
      }))
      .pipe(filter<{ model: InternalUser, click: UserClickOn }>(({click}) => click === UserClickOn.YES))
      .pipe(exhaustMap(({model}) => model.delete().pipe(mapTo(model))))
      .pipe(tap(model => this.toast.success(this.lang.map.msg_delete_x_success.change({x: model.getName()}))))
      .subscribe(() => this.reload$.next(null));
  }

  activateInternalUser(model: InternalUser): void {
    const sub = model.updateStatus(CommonStatusEnum.ACTIVATED).subscribe(() => {
      this.toast.success(this.lang.map.msg_update_x_success.change({x: model.getName()}));
      this.reload$.next(null);
      sub.unsubscribe();
    });
  }

  deactivateInternalUser(model: InternalUser): void {
    const sub = model.updateStatus(CommonStatusEnum.DEACTIVATED).subscribe(() => {
      this.toast.success(this.lang.map.msg_update_x_success.change({x: model.getName()}));
      this.reload$.next(null);
      sub.unsubscribe();
    });
  }

  listenToAdd(): void {
    this.add$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap(() => this.service.openCreateDialog(this.models)))
      .subscribe(() => this.reload$.next(null));
  }

  edit(internalUser: InternalUser, $event?: MouseEvent): void {
    $event?.preventDefault();
    this.service.openUpdateDialog(internalUser.id, this.models)
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((dialog: DialogRef) => {
        return dialog.onAfterClose$;
      }))
      .subscribe((_) => {
        this.reload$.next(null);
      });
  }
}
