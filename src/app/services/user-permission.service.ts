import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {UrlService} from "@app/services/url.service";
import {Observable} from "rxjs";
import {UserPermission} from "@app/models/user-permission";
import {Generator} from "@app/decorators/generator";

@Injectable({
  providedIn: 'root'
})
export class UserPermissionService {

  constructor(private http: HttpClient, private urlService: UrlService) {
  }

  _getServiceURL(): string {
    return this.urlService.URLS.INTERNAL_USER_PERMISSIONS;
  }

  @Generator(UserPermission, true)
  private _loadUserPermissions(userId: number): Observable<UserPermission[]> {
    return this.http.get<UserPermission[]>(this._getServiceURL() + '/internal/' + userId)
  }

  private _saveUserPermissions(userId: number, permissions: number[]): Observable<any> {
    return this.http.post(this._getServiceURL() + '/' + userId + '/bulk', permissions);
  }

  saveUserPermissions(userId: number, permissions: number[]): Observable<any> {
    return this._saveUserPermissions(userId, permissions);
  }

  loadUserPermissions(userId: number): Observable<UserPermission[]> {
    return this._loadUserPermissions(userId);
  }

  loadPermissionsAsBlob(internalUserId: number): Observable<Blob> {
    return this.http.get(this._getServiceURL() + '/export/' + internalUserId, {responseType: 'blob'});
  }


}
