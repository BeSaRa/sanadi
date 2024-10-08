import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CastResponse, CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { CrudGenericService } from '@app/generics/crud-generic-service';
import { RestrictedAdvancedSearchResult } from '@app/models/restricted-advanced-search';
import { WorldCheckSearch } from '@app/models/world-check-search';
import { WorldCheckSearchResult } from '@app/models/world-check-search-result';
import { WorldCheckSearchResultPopupComponent } from '@app/restricted/popups/world-check-search-result-popup/world-check-search-result-popup.component';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { WorldCheckSearchCriteria } from './../models/world-check-search-criteria';
import { DialogService } from './dialog.service';
import { FactoryService } from './factory.service';
import { UrlService } from './url.service';
import { AdvancedSearchResultsPopupComponent } from '@app/restricted/popups/advanced-search-results-popup/advanced-search-results-popup.component';
import { BannedPerson } from '@app/models/banned-person';
import { BannedPersonTerrorism } from '@app/models/BannedPersonTerrorism';

@CastResponseContainer({
  $default: {
    model: () => WorldCheckSearch
  }
})
@Injectable({
  providedIn: 'root'
})
export class WorldCheckService extends CrudGenericService<WorldCheckSearch> {
  list!: WorldCheckSearch[];

  constructor(public http: HttpClient, private urlService: UrlService, private dialog: DialogService) {
    super();
    FactoryService.registerService('WorldCheckService', this);
  }

  _getModel(): any {
    return WorldCheckSearch;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.WORLD_CHECK;
  }
  _getScreeningURL(): string {
    return this.urlService.URLS.SCREENING;
  }

  @CastResponse(undefined)
  private _loadByCriteria(criteria: {}): Observable<WorldCheckSearchCriteria[]> {
    return this.http.post<WorldCheckSearchCriteria[]>(this._getServiceURL() + '/criteria', criteria);
  }

  loadByCriteria(criteria: {}): Observable<WorldCheckSearchCriteria[]> {
    return this._loadByCriteria(criteria);
  }


  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _loadByInquire(inquire: {}): Observable<WorldCheckSearchResult> {
    return this.http.post<WorldCheckSearchResult>(this._getServiceURL() + '/inquiry', inquire);
  }
  loadByInquire(inquire: {}): Observable<WorldCheckSearchResult> {
    return this._loadByInquire(inquire).pipe(map((rs: any) => {
      return { id: rs.id, ...rs.response };
    }))
  }

  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _getInquiryById(id: number): Observable<WorldCheckSearchResult> {
    return this.http.get<WorldCheckSearchResult>(this._getServiceURL() + '/inquiry/' + id);
  }

  getInquiryById(id: number): Observable<WorldCheckSearchResult> {
    return this._getInquiryById(id).pipe(map((rs: any) => {
      return {
        id, ...rs.response
      }
    }))
      .pipe(catchError(_ => of(new WorldCheckSearchResult())))
  }

  getInquiryRacaById(id: number): Observable<{ id?: number, response: BannedPerson[] }> {
    return this.http.get<{ id: number, response: BannedPerson[] }>(this._getScreeningURL() + 'banned-person/raca/inquiry/' + id)
      .pipe(
        map((result: any) => result.rs),
        map((rs: any) => {
           rs.response = rs.response.map((item: any) => new BannedPerson().clone(item))
          return rs
        }),
        catchError(_ => of({ response: [] }))
      )
  }
  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  getInquiryMOIById(id: number): Observable<{ id?: number, response: BannedPersonTerrorism[] }> {
    return this.http.get<{ id?: number, response: BannedPersonTerrorism[] }>(this._getScreeningURL() + 'banned-person/moi/inquiry/' + id)
    .pipe(
      map((result: any) => result.rs),
      map((rs: any) => {
         rs.response = rs.response.map((item: any) => new BannedPersonTerrorism().clone(item))
        return rs
      }),
      catchError(_ => of({ response: [] }))
    )
  }
  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  // first ==> id
  // second ==> decision
  worlddCheckInquire(inquire: { id: number, actionType: string, comment: string }): Observable<boolean> {
    return this.http.put<boolean>(this._getServiceURL() + '/inquiry/status', inquire);
  }
  openViewWorldCheckSearchResult(result: WorldCheckSearchResult, operation?: OperationTypes): DialogRef {
    return this.dialog.show(WorldCheckSearchResultPopupComponent, {
      result,
      operation
    });
  }
  openAdvancedSearchResult(result: RestrictedAdvancedSearchResult, operation?: OperationTypes): DialogRef {
    return this.dialog.show(AdvancedSearchResultsPopupComponent, {
      result,
      operation
    });
  }
}
