import {Injectable} from '@angular/core';
import {FactoryService} from '@app/services/factory.service';
import {HttpClient} from '@angular/common/http';
import {UrlService} from '@app/services/url.service';
import {BackendGenericService} from '@app/generics/backend-generic-service';
import {OrgUnitService} from '@app/models/org-unit-service';
import {OrganizationUnitServicesInterceptor} from '@app/model-interceptors/organization-unit-services-interceptor';
import {Observable, of} from 'rxjs';
import {Generator} from '@app/decorators/generator';

@Injectable({
  providedIn: 'root'
})
export class OrganizationUnitServicesService extends BackendGenericService<OrgUnitService> {
  list!: OrgUnitService[];
  interceptor: OrganizationUnitServicesInterceptor = new OrganizationUnitServicesInterceptor();

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

  _getReceiveInterceptor(): any {
    return this.interceptor.receive;
  }

  _getSendInterceptor(): any {
    return this.interceptor.send;
  }

  @Generator(undefined, true, {property: 'rs'})
  loadLinkedServicesByOrgId(orgId: number): Observable<OrgUnitService[]> {
    if (!orgId) {
      return of([]);
    }
    return this.http.get<OrgUnitService[]>(this._getServiceURL() + '/org-unit/' + orgId);
  }
}
