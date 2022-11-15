import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CastResponse, CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { Pagination } from '@app/models/pagination';
import { ProfileServiceRelation } from '@app/models/profile-service-relation';
import { DialogService } from './dialog.service';
import { FactoryService } from './factory.service';
import { UrlService } from './url.service';

@CastResponseContainer({
  $default: {
    model: () => ProfileServiceRelation,
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => ProfileServiceRelation },
  },
})
@Injectable({
  providedIn: 'root'
})
export class ProfileServiceRelationService extends CrudWithDialogGenericService<ProfileServiceRelation>{

  list: ProfileServiceRelation[] = [];

  constructor(public dialog: DialogService, public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('ProfileServiceRelationService', this);
  }
  _getDialogComponent(): ComponentType<any> {
    throw new Error('Method not implemented.');
  }
  _getModel(): new () => ProfileServiceRelation {
    return ProfileServiceRelation;
  }
  _getServiceURL(): string {
    return this.urlService.URLS.PROFILE_SERVICE;
  }
  @CastResponse(undefined)
  getServicesByProfile(profileId: number) {
    return this.http.get<ProfileServiceRelation[]>(this._getServiceURL() + `/profile/${profileId}`);
  }
}
