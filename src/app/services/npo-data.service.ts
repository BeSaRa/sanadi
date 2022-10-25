import { Observable } from 'rxjs';
import { CrudGenericService } from '@app/generics/crud-generic-service';
import { NpoData } from './../models/npo-data';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UrlService } from '@app/services/url.service';
import { DialogService } from '@app/services/dialog.service';
import { FactoryService } from '@app/services/factory.service';
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";

@CastResponseContainer({
  $default: {
    model: () => NpoData
  }
})
@Injectable({
  providedIn: 'root'
})
export class NpoDataService extends CrudGenericService<NpoData> {
  list: NpoData[] = [];
  constructor(public http: HttpClient,
    private urlService: UrlService,
    public dialog: DialogService) {
    super();
    FactoryService.registerService('NpoDataService', this);
  }

  _getModel(): new () => NpoData {
    return NpoData
  }
  _getServiceURL(): string {
    return this.urlService.URLS.NPO_DATA;
  }

  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  loadCompositeById(id: number): Observable<NpoData[]> {
    return this.http.get<NpoData[]>(this._getServiceURL() + '/' + id + '/composite');
  }

  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  loadActiveAsLookup(): Observable<NpoData[]> {
    return this.http.get<NpoData[]>(this._getServiceURL() + '/active/lookup');
  }
}
