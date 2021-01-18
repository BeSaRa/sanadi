import {Injectable} from '@angular/core';
import {FactoryService} from './factory.service';
import {BackendGenericService} from '../generics/backend-generic-service';
import {CustomRolePermission} from '../models/custom-role-permission';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UrlService} from './url.service';
import {combineLatest, Observable, of} from 'rxjs';
import {catchError, concatMap, map, mapTo, switchMap, tap} from 'rxjs/operators';
import {Generator} from '../decorators/generator';

@Injectable({
  providedIn: 'root'
})
export class CustomRolePermissionService extends BackendGenericService<CustomRolePermission> {
  list!: CustomRolePermission[];

  constructor(public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('CustomRolePermissionService', this);
  }

  _getModel(): any {
    return CustomRolePermission;
  }

  _getSendInterceptor(): any {
    return (model: any) => {
      delete model.service;
      return model;
    };
  }

  _getServiceURL(): string {
    return this.urlService.URLS.CUSTOM_ROLE_PERMISSIONS;
  }

  @Generator(CustomRolePermission, true)
  getByCustomRoleId(customRoleId: any | number): Observable<CustomRolePermission[]> {
    return this.http.get<CustomRolePermission[]>(this.urlService.URLS.CUSTOM_ROLE_PERMISSIONS, {
      params: new HttpParams({
        fromObject: {customRoleId}
      })
    });
  }

  deleteByCustomRoleId(customRoleId: any | number): Observable<boolean> {
    const result: Observable<Boolean>[] = [];
    return this.getByCustomRoleId(customRoleId).pipe(
      switchMap(items => {
        if (!items.length) {
          result.push(of(true));
        }
        items.forEach(i => result.push(i.delete()));
        return result;
      }),
      map(items => combineLatest(items)),
      mapTo(true)
    );
  }


  createBulkByCustomRoleId(permissionIds: number[], customRoleId: number): Observable<CustomRolePermission[]> {
    return this.generateModels(permissionIds, customRoleId).pipe(
      concatMap(items => {
        return combineLatest(items.map(item => item.save()));
      })
    );
  }

  private generateModels(permissionIds: number[], customRoleId: number): Observable<CustomRolePermission[]> {
    return new Observable((subscriber) => {
      subscriber.next(permissionIds.map(permissionId => {
        const item = (new CustomRolePermission());
        item.customRoleId = customRoleId;
        item.permissionId = permissionId;
        return item;
      }));
    });
  }
}
