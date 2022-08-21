import { Injectable } from '@angular/core';
import { FactoryService } from './factory.service';
import { CustomRolePermission } from '../models/custom-role-permission';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UrlService } from './url.service';
import { combineLatest, Observable, of } from 'rxjs';
import { concatMap, map, mapTo, switchMap } from 'rxjs/operators';
import { Pagination } from "@app/models/pagination";
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";
import { CrudGenericService } from "@app/generics/crud-generic-service";

@CastResponseContainer({
  $default: {
    model: () => CustomRolePermission
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => CustomRolePermission }
  }
})
@Injectable({
  providedIn: 'root'
})
export class CustomRolePermissionService extends CrudGenericService<CustomRolePermission> {
  list!: CustomRolePermission[];

  constructor(public http: HttpClient,
              private urlService: UrlService) {
    super();
    FactoryService.registerService('CustomRolePermissionService', this);
  }

  _getModel(): any {
    return CustomRolePermission;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.CUSTOM_ROLE_PERMISSIONS;
  }

  @CastResponse(undefined)
  getByCustomRoleId(customRoleId: any | number): Observable<CustomRolePermission[]> {
    return this.http.get<CustomRolePermission[]>(this.urlService.URLS.CUSTOM_ROLE_PERMISSIONS, {
      params: new HttpParams({
        fromObject: { customRoleId }
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
