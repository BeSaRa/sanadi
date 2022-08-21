import { Injectable } from '@angular/core';
import { SanadiAttachment } from '../models/sanadi-attachment';
import { HttpClient } from '@angular/common/http';
import { FactoryService } from './factory.service';
import { UrlService } from './url.service';
import { Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { CrudGenericService } from "@app/generics/crud-generic-service";
import { Pagination } from "@app/models/pagination";
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";
import { HasInterception, InterceptParam } from "@decorators/intercept-model";

@CastResponseContainer({
  $default: {
    model: () => SanadiAttachment
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => SanadiAttachment }
  }
})
@Injectable({
  providedIn: 'root'
})
export class AttachmentService extends CrudGenericService<SanadiAttachment> {
  list!: SanadiAttachment[];
  _loadDone$!: Subject<SanadiAttachment[]>;

  constructor(public http: HttpClient,
              private urlService: UrlService) {
    super();
    FactoryService.registerService('AttachmentService', this);
  }

  @CastResponse(undefined)
  loadByRequestId(requestId: number): Observable<SanadiAttachment[]> {
    return this.http.get<SanadiAttachment[]>(this._getServiceURL() + '/request-id/' + requestId);
  }

  @HasInterception
  saveAttachment(@InterceptParam() attachmentData: SanadiAttachment, attachment: File): Observable<string> {
    if (!attachmentData || (!attachmentData.vsId && !attachment)) {
      return of('MISSING_DATA');
    }
    let url = this._getServiceURL(), form = new FormData();
    if (attachmentData.vsId) {
      url += '/update';
    }

    form.append('entity', JSON.stringify(attachmentData));
    form.append('content', attachment || null);

    return this.http.post<string>(url, form)
      .pipe(map((response: any) => response.rs));
  }

  loadByVsIdAsBlob(vsId: string): Observable<Blob> {
    return this.http.get(this._getServiceURL() + '/content/' + vsId, { responseType: 'blob' });
  }

  deleteByVsId(vsId: string): Observable<boolean> {
    return this.http.delete<boolean>(this._getServiceURL() + '/' + vsId);
  }

  _getModel(): any {
    return SanadiAttachment;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.SANADI_ATTACHMENT;
  }
}
