import {Injectable} from '@angular/core';
import {SubventionRequest} from '../models/subvention-request';
import {SubventionRequestInterceptor} from '../model-interceptors/subvention-request-interceptor';
import {BackendGenericService} from '../generics/backend-generic-service';
import {FactoryService} from './factory.service';
import {SubventionRequestPartialInterceptor} from '../model-interceptors/subvention-request-partial-interceptor';
import {SubventionRequestPartial} from '../models/subvention-request-partial';
import {UrlService} from './url.service';
import {HttpClient} from '@angular/common/http';
import {LangService} from './lang.service';
import {Generator} from '../decorators/generator';
import {Observable, of} from 'rxjs';
import {IPartialRequestCriteria} from '../interfaces/i-partial-request-criteria';
import {DialogRef} from '../shared/models/dialog-ref';
import {switchMap} from 'rxjs/operators';
import {RequestDetailsPopupComponent} from '../user/popups/request-details-popup/request-details-popup.component';
import {DialogService} from './dialog.service';
import {MenuItemInterceptor} from '../model-interceptors/menu-item-interceptor';
import {OrgUnit} from '../models/org-unit';
import {FilterRequestPopupComponent} from '../user/popups/filter-request-popup/filter-request-popup.component';
import {OrganizationUnitService} from './organization-unit.service';
import {SubventionRequestService} from './subvention-request.service';

@Injectable({
  providedIn: 'root'
})
export class SubventionRequestPartialService extends BackendGenericService<SubventionRequestPartial> {
  list!: SubventionRequestPartial[];

  constructor(private urlService: UrlService,
              public http: HttpClient,
              private langService: LangService,
              private dialogService: DialogService,
              private orgUnitService: OrganizationUnitService) {
    super();
    FactoryService.registerService('SubventionRequestPartialService', this);
  }

  _getModel() {
    return SubventionRequestPartial;
  }

  _getSendInterceptor() {
    return SubventionRequestPartialInterceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.SUBVENTION_REQUEST_PARTIAL;
  }

  _getReceiveInterceptor() {
    return SubventionRequestPartialInterceptor.receive;
  }


  @Generator(undefined, true, {property: 'rs'})
  loadPartialRequests(): Observable<SubventionRequestPartial[]> {
    return this.http.get<SubventionRequestPartial[]>(this._getServiceURL() + '/active');
  }

  // @ts-ignore
  @Generator(undefined, true, {property: 'rs'})
  loadPartialRequestsByCriteria(criteria: Partial<IPartialRequestCriteria>): Observable<SubventionRequestPartial[]> {
    return this.http.get<SubventionRequestPartial[]>(this._getServiceURL() + '/criteria' + this._generateQueryString(criteria));
  }

  /**
   * @description Opens the details for the given partial request
   * @param requestId
   */
  openPartialRequestDetailsDialog(requestId: number): Observable<DialogRef> {
    const subventionRequestService = FactoryService.getService<SubventionRequestService>('SubventionRequestService');
    return subventionRequestService.loadPartialRequestById(requestId)
      .pipe(
        switchMap((requestData: SubventionRequest) => {
          return of(this.dialogService.show(RequestDetailsPopupComponent, {
            requestData,
            allowAddPartialRequest: true
          }));
        })
      );
  }

  /**
   * @description Opens the filter dialog for partial requests
   * @param filterCriteria
   */
  openFilterPartialRequestDialog(filterCriteria: Partial<IPartialRequestCriteria>): Observable<DialogRef> {
    return this.orgUnitService.load().pipe(
      switchMap((orgUnits: OrgUnit[]) => {
        return of(this.dialogService.show(FilterRequestPopupComponent, {
          criteria: filterCriteria,
          orgUnits: orgUnits
        }));
      })
    )
  }

}
