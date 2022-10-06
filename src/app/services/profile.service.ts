import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProfilePopupComponent } from '@app/administration/popups/profile-popup/profile-popup.component';
import { CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { Pagination } from '@app/models/pagination';
import { Profile } from '@app/models/profile';
import { DialogService } from './dialog.service';
import { FactoryService } from './factory.service';
import { UrlService } from './url.service';

@CastResponseContainer({
  $default: {
    model: () => Profile,
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => Profile },
  },
})
@Injectable({
  providedIn: 'root'
})
export class ProfileService extends CrudWithDialogGenericService<Profile>{
  list: Profile[] = [];
  constructor(public dialog: DialogService, public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('ProfileService', this);
  }
  _getDialogComponent(): ComponentType<any> {
    return ProfilePopupComponent;
  }
  _getModel(): new () => Profile {
    return Profile;
  }
  _getServiceURL(): string {
    return this.urlService.URLS.PROFILE;
  }

}
