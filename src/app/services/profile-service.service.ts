import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CastResponse, CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { Pagination } from '@app/models/pagination';
import { ProfileService } from '@app/models/profile-service';
import { DialogService } from './dialog.service';
import { FactoryService } from './factory.service';
import { UrlService } from './url.service';

@CastResponseContainer({
  $default: {
    model: () => ProfileService,
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => ProfileService },
  },
})
@Injectable({
  providedIn: 'root'
})
export class ProfileServiceService extends CrudWithDialogGenericService<ProfileService>{

  list: ProfileService[] = [];

  constructor(public dialog: DialogService, public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('ProfileServiceService', this);
  }
  _getDialogComponent(): ComponentType<any> {
    throw new Error('Method not implemented.');
  }
  _getModel(): new () => ProfileService {
    return ProfileService;
  }
  _getServiceURL(): string {
    return this.urlService.URLS.PROFILE_SERVICE;
  }
  @CastResponse(undefined)
  getServicesByProfile(profileId: number) {
    return this.http.get<ProfileService[]>(this._getServiceURL() + `/profile/${profileId}`);
  }
}
