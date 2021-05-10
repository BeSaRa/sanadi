import {Injectable} from '@angular/core';
import {SanadiAttachment} from '../models/sanadi-attachment';
import {HttpClient} from '@angular/common/http';
import {FactoryService} from './factory.service';
import {BackendGenericService} from '../generics/backend-generic-service';
import {UrlService} from './url.service';
import {SanadiAttachmentInterceptor} from '../model-interceptors/sanadi-attachment-interceptor';
import {isEmptyObject} from '../helpers/utils';
import {Observable, of, Subject} from 'rxjs';
import {Generator} from '../decorators/generator';
import {map} from 'rxjs/operators';
import {InterceptParam, SendInterceptor} from '../decorators/model-interceptor';

@Injectable({
  providedIn: 'root'
})
export class AttachmentService extends BackendGenericService<SanadiAttachment> {
  list!: SanadiAttachment[];
  _loadDone$!: Subject<SanadiAttachment[]>;

  constructor(public http: HttpClient,
              private urlService: UrlService) {
    super();
    FactoryService.registerService('AttachmentService', this);
  }

  @Generator(undefined, true, {property: 'rs'})
  loadByRequestId(requestId: number): Observable<SanadiAttachment[]> {
    return this.http.get<SanadiAttachment[]>(this._getServiceURL() + '/request-id/' + requestId);
  }

  @SendInterceptor()
  saveAttachment(@InterceptParam() attachmentData: SanadiAttachment, attachment: File): Observable<string> {
    if (!attachmentData || isEmptyObject(attachmentData) || (!attachmentData.vsId && !attachment)) {
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
    return this.http.get(this._getServiceURL() + '/content/' + vsId, {responseType: 'blob'});
  }

  deleteByVsId(vsId: string): Observable<boolean> {
    return this.http.delete<boolean>(this._getServiceURL() + '/' + vsId);
  }

  _getModel(): any {
    return SanadiAttachment;
  }

  _getSendInterceptor(): any {
    return SanadiAttachmentInterceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.SANADI_ATTACHMENT;
  }

  _getReceiveInterceptor(): any {
    return SanadiAttachmentInterceptor.receive;
  }
}
