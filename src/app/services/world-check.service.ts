import { WorldCheckSearchCriteria } from './../models/world-check-search-criteria';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UrlService } from './url.service';
import { FactoryService } from './factory.service';
import { CastResponse, CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { WorldCheckSearch } from '@app/models/world-check-search';
import { CrudGenericService } from '@app/generics/crud-generic-service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DialogService } from './dialog.service';
import { WorldCheckSearchResultPopupComponent } from '@app/restricted/popups/world-check-search-result-popup/world-check-search-result-popup.component';
import { WorldCheckSearchResult } from '@app/models/world-check-search-result';
import { OperationTypes } from '@app/enums/operation-types.enum';

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

  @CastResponse(undefined)
  private _loadByCriteria(criteria: { }): Observable<WorldCheckSearchCriteria[]> {
    return this.http.post<WorldCheckSearchCriteria[]>(this._getServiceURL() + '/criteria', criteria);
  }

  loadByCriteria(criteria: { }): Observable<WorldCheckSearchCriteria[]> {
    return this._loadByCriteria(criteria);
  }


  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _loadByInquire(inquire: { }): Observable<WorldCheckSearchResult> {
    return this.http.post<WorldCheckSearchResult>(this._getServiceURL() + '/inquiry', inquire);
  }
  loadByInquire(inquire: { }): Observable<WorldCheckSearchResult> {
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
    return this._getInquiryById(id).pipe(map((rs: any) => rs.response))
  }
  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  // first ==> id
  // second ==> decision
  worlddCheckInquire(inquire: {first: string, second: string, comment: string}): Observable<boolean> {
    return this.http.put<boolean>(this._getServiceURL() + '/inquiry/status', inquire);
  }
  openViewWorldCheckSearchResult(result: WorldCheckSearchResult, operation?: OperationTypes): DialogRef {
    return this.dialog.show(WorldCheckSearchResultPopupComponent, {
      result,
      operation
    });
  }
}
