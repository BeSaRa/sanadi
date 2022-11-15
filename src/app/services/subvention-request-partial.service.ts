import {Injectable} from '@angular/core';
import {FactoryService} from './factory.service';
import {SubventionRequestPartial} from '../models/subvention-request-partial';
import {UrlService} from './url.service';
import {HttpClient} from '@angular/common/http';
import {LangService} from './lang.service';
import {Observable, of} from 'rxjs';
import {IPartialRequestCriteria} from '@contracts/i-partial-request-criteria';
import {DialogRef} from '../shared/models/dialog-ref';
import {switchMap} from 'rxjs/operators';
import {RequestDetailsPopupComponent} from '../sanady/popups/request-details-popup/request-details-popup.component';
import {DialogService} from './dialog.service';
import {FilterRequestPopupComponent} from '../sanady/popups/filter-request-popup/filter-request-popup.component';
import {SubventionResponseService} from './subvention-response.service';
import {SubventionResponse} from '../models/subvention-response';
import {CrudGenericService} from '@app/generics/crud-generic-service';
import {CastResponse, CastResponseContainer} from '@decorators/cast-response';
import {ProfileService} from '@services/profile.service';
import {Profile} from '@app/models/profile';

@CastResponseContainer({
  $default: {
    model: () => SubventionRequestPartial
  }
})

@Injectable({
  providedIn: 'root'
})
export class SubventionRequestPartialService extends CrudGenericService<SubventionRequestPartial> {
  list!: SubventionRequestPartial[];

  constructor(private urlService: UrlService,
              public http: HttpClient,
              private langService: LangService,
              private dialogService: DialogService,
              private profileService: ProfileService) {
    super();
    FactoryService.registerService('SubventionRequestPartialService', this);
  }

  _getModel() {
    return SubventionRequestPartial;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.SUBVENTION_REQUEST_PARTIAL;
  }

  @CastResponse(undefined)
  loadPartialRequests(): Observable<SubventionRequestPartial[]> {
    return this.http.get<SubventionRequestPartial[]>(this._getServiceURL() + '/active');
  }

  @CastResponse(undefined)
  loadPartialRequestsByCriteria(criteria: Partial<IPartialRequestCriteria>): Observable<SubventionRequestPartial[]> {
    return this.http.post<SubventionRequestPartial[]>(this._getServiceURL() + '/criteria', criteria);
  }

  /**
   * @description Opens the details for the given partial request
   * @param requestId
   */
  openPartialRequestDetailsDialog(requestId: number): Observable<DialogRef> {
    const subventionResponseService = FactoryService.getService<SubventionResponseService>('SubventionResponseService');
    return subventionResponseService.loadPartialRequestById(requestId)
      .pipe(
        switchMap((response: SubventionResponse) => {
          return of(this.dialogService.show(RequestDetailsPopupComponent, {
            subventionResponse: response,
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
    return this.profileService.loadAsLookups().pipe(
      switchMap((orgUnits: Profile[]) => {
        return of(this.dialogService.show(FilterRequestPopupComponent, {
          criteria: filterCriteria,
          orgUnits: orgUnits
        }, {
          escToClose: true
        }));
      })
    )
  }

}
