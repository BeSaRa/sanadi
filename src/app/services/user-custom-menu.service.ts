import {Injectable} from '@angular/core';
import {UserCustomMenu} from '@app/models/user-custom-menu';
import {UrlService} from '@services/url.service';
import {DialogService} from '@services/dialog.service';
import {HttpClient} from '@angular/common/http';
import {CrudGenericService} from '@app/generics/crud-generic-service';
import {Observable} from 'rxjs';
import {CastResponse} from '@decorators/cast-response';
import {FactoryService} from '@services/factory.service';

@Injectable({
  providedIn: 'root'
})
export class UserCustomMenuService extends CrudGenericService<UserCustomMenu> {
  list: UserCustomMenu[] = [];

  constructor(public dialog: DialogService,
              public http: HttpClient,
              private urlService: UrlService) {
    super();
    FactoryService.registerService('UserCustomMenuService', this);
  }

  _getModel(): new () => UserCustomMenu {
    return UserCustomMenu;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.USER_MENU_ITEM;
  }

  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  loadByCriteria(criteria: Partial<UserCustomMenu>): Observable<UserCustomMenu[]> {
    return this.http.post<UserCustomMenu[]>(this._getServiceURL() + '/filter', criteria);
  }

  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  saveUserCustomMenu(generalUserId: number, data: number[]): Observable<UserCustomMenu[]> {
    return this.http.post<UserCustomMenu[]>(this._getServiceURL() + '/' + generalUserId, data);
  }

  loadPermissionsAsBlob(generalUserId: number): Observable<Blob> {
    return this.http.get(this._getServiceURL() + '/export/' + generalUserId, { responseType: 'blob' });
  }
}
