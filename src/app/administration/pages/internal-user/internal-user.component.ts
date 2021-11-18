import {Component} from '@angular/core';
import {AdminGenericComponent} from "@app/generics/admin-generic-component";
import {InternalUser} from "@app/models/internal-user";
import {LangService} from "@app/services/lang.service";
import {InternalUserService} from "@app/services/internal-user.service";
import {IMenuItem} from "@app/modules/context-menu/interfaces/i-menu-item";

@Component({
  selector: 'internal-user',
  templateUrl: './internal-user.component.html',
  styleUrls: ['./internal-user.component.scss']
})
export class InternalUserComponent extends AdminGenericComponent<InternalUser, InternalUserService> {
  displayedColumns: string[] = ['select', 'username', 'arName', 'enName', 'defaultDepartment', 'status', 'actions'];
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
              public service: InternalUserService) {
    super();
  }
}
