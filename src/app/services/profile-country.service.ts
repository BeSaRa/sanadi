import { CrudGenericService } from '@app/generics/crud-generic-service';
import { FactoryService } from '@services/factory.service';
import { UrlService } from '@app/services/url.service';
import { HttpClient } from '@angular/common/http';
import { DialogService } from '@app/services/dialog.service';
import { Pagination } from '@app/models/pagination';
import { Injectable } from '@angular/core';
import { CastResponse, CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { ProfileCountry } from '@app/models/profile-country';

@CastResponseContainer({
  $default: {
    model: () => ProfileCountry,
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => ProfileCountry },
  },
})
@Injectable({
  providedIn: 'root'
})
export class ProfileCountryService extends CrudGenericService<ProfileCountry> {
  list: ProfileCountry[] = [];

  constructor(public dialog: DialogService,
    public http: HttpClient,
    private urlService: UrlService) {
    super();
    FactoryService.registerService('ProfileService', this);
  }

  _getModel(): new () => ProfileCountry {
    return ProfileCountry;
  }
  _getServiceURL(): string {
    return this.urlService.URLS.PROFILE_COUNTRY;
  }

  @CastResponse(undefined)
  getCountriesByProfile(profileId: number) {
    return this.http.get<ProfileCountry[]>(this._getServiceURL() + '/profile/' + profileId);
  }
}
