import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CrudGenericService } from "@app/generics/crud-generic-service";
import { FollowupPermission } from '@app/models/followup-permission';
import { UrlService } from "@services/url.service";
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";
import { AdminResult } from "@app/models/admin-result";
import { FactoryService } from "@services/factory.service";
import { Observable } from "rxjs";

@CastResponseContainer({
  $default: {
    model: () => FollowupPermission,
    shape: {
      teamInfo: () => AdminResult
    }
  }
})
@Injectable({
  providedIn: 'root'
})
export class FollowupPermissionService extends CrudGenericService<FollowupPermission> {
  _getModel(): new () => FollowupPermission {
    return FollowupPermission
  }

  list: FollowupPermission[] = [];

  _getServiceURL(): string {
    return this.urlService.URLS.FOLLOWUP_PERMISSION
  }

  constructor(public http: HttpClient, private urlService: UrlService) {
    super()
    FactoryService.registerService('FollowupPermissionService', this)
  }

  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  getFollowupPermissionsByGeneralUserId(generalUserId: number): Observable<FollowupPermission[]> {
    return this.http.get<FollowupPermission[]>(this._getServiceURL() + '/general-user-id/' + generalUserId)
  }
}
