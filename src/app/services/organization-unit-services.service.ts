import { Injectable } from '@angular/core';
import { FactoryService } from '@app/services/factory.service';
import { HttpClient } from '@angular/common/http';
import { UrlService } from '@app/services/url.service';
import { OrgUnitService } from '@app/models/org-unit-service';
import { Observable, of } from 'rxjs';
import { Pagination } from "@app/models/pagination";
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";
import { CrudGenericService } from "@app/generics/crud-generic-service";

@CastResponseContainer({
  $default: {
    model: () => OrgUnitService
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => OrgUnitService }
  }
})
@Injectable({
  providedIn: 'root'
})
export class OrganizationUnitServicesService extends CrudGenericService<OrgUnitService> {
  list!: OrgUnitService[];

  constructor(public http: HttpClient,
              private urlService: UrlService) {
    super();
    FactoryService.registerService('OrganizationUnitServicesService', this);
  }

  _getServiceURL(): string {
    return this.urlService.URLS.ORGANIZATION_UNIT_SERVICES;
  }

  _getModel(): any {
    return OrgUnitService;
  }

  @CastResponse(undefined)
  loadLinkedServicesByOrgId(orgId: number): Observable<OrgUnitService[]> {
    if (!orgId) {
      return of([]);
    }
    return this.http.get<OrgUnitService[]>(this._getServiceURL() + '/org-unit/' + orgId);
  }
}
