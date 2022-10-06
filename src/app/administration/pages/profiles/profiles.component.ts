import { Component, OnInit } from '@angular/core';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { Profile } from '@app/models/profile';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { LangService } from '@app/services/lang.service';
import { ProfileService } from '@app/services/profile.service';
import { ToastService } from '@app/services/toast.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.scss']
})
export class ProfilesComponent extends AdminGenericComponent<Profile, ProfileService> {
  actions: IMenuItem<Profile>[] = [];
  displayedColumns: string[] = ['arName', 'enName', 'status', 'actions'];

  constructor(public service: ProfileService, public lang: LangService, private toast: ToastService) {
    super();
  }

  afterReload(): void {
    console.log(this.models);

  }
  public view(row: Profile, event: MouseEvent) {

  }
  public delete(event: MouseEvent, row: Profile) {

  }
  public edit(row: Profile, event: MouseEvent,) {

  }
  public toggleStatus(model: Profile) {

  }


}
