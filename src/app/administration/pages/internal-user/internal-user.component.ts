import {Component} from '@angular/core';
import {AdminGenericComponent} from "@app/generics/admin-generic-component";
import {InternalUser} from "@app/models/internal-user";
import {LangService} from "@app/services/lang.service";
import {InternalUserService} from "@app/services/internal-user.service";
import {IMenuItem} from "@app/modules/context-menu/interfaces/i-menu-item";
import {Subject} from "rxjs";
import {exhaustMap, filter, map, mapTo, takeUntil, tap} from "rxjs/operators";
import {DialogService} from "@app/services/dialog.service";
import {UserClickOn} from "@app/enums/user-click-on.enum";
import {ToastService} from "@app/services/toast.service";

@Component({
  selector: 'internal-user',
  templateUrl: './internal-user.component.html',
  styleUrls: ['./internal-user.component.scss']
})
export class InternalUserComponent extends AdminGenericComponent<InternalUser, InternalUserService> {
  displayedColumns: string[] = ['select', 'username', 'arName', 'enName', 'defaultDepartment', 'status', 'actions'];
  // subject for emit clicking om delete button
  delete$: Subject<InternalUser> = new Subject<InternalUser>();
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

  listenToDelete() {
    this.delete$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.dialog.confirm(this.lang.map.msg_confirm_delete_x.change({x: model.getName()}))
          .onAfterClose$
          .pipe(map((click: UserClickOn) => {
            return {model, click}
          }));
      }))
      .pipe(filter<{ model: InternalUser, click: UserClickOn }>(({click}) => click === UserClickOn.YES))
      .pipe(exhaustMap(({model}) => model.delete().pipe(mapTo(model))))
      .pipe(tap(model => this.toast.success(this.lang.map.msg_delete_x_success.change({x: model.getName()}))))
      .subscribe(() => this.reload$.next(null));
  }
}
