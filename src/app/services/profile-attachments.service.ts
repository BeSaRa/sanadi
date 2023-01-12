import { HttpClient, HttpEventType, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CastResponse } from '@app/decorators/decorators/cast-response';
import { BlobModel } from '@app/models/blob-model';
import { FileNetDocument } from '@app/models/file-net-document';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { ViewDocumentPopupComponent } from '@app/shared/popups/view-document-popup/view-document-popup.component';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { DialogService } from './dialog.service';
import { UrlService } from './url.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileAttachmentsService {

  constructor(
    private http: HttpClient,
    private urlService:UrlService, 
    private dialog:DialogService, 
    private domSanitizer:DomSanitizer) 
    { }
  
  @CastResponse(() => FileNetDocument, {
    fallback: '$default',
    unwrap: 'rs'
  })
  public loadAttachments(profileId: string): Observable<FileNetDocument[]> {
    return this.http.get<FileNetDocument[]>(this._getURLSegment() + '/' + profileId + '/folder/contained-documents');
  }
  private _getURLSegment(){
    return this.urlService.URLS.PROFILE;
  }
  viewDocument(model: BlobModel, document: FileNetDocument): DialogRef {
    return this.dialog.show(ViewDocumentPopupComponent, {
      model: document,
      blob: model
    }, {
      escToClose: true
    });
  }
  downloadDocument(docId: string): Observable<BlobModel> {
    return this.http.get(this._getURLSegment() + '/document/' + docId + '/download', {
      observe: 'body',
      responseType: 'blob'
    }).pipe(map(blob => new BlobModel(blob, this.domSanitizer)));
  }

  addSingleDocument(
    profileId: string, 
    document: FileNetDocument, 
    progressCallback?: (percentage: number) => void
    ): Observable<FileNetDocument> {

    const clonedDocument = document.clone() as Partial<FileNetDocument>;
    const content = clonedDocument.files?.item(0);
    const formData = new FormData();
    delete clonedDocument.files;
    delete clonedDocument.dialog;
    delete clonedDocument.searchFields;
    delete clonedDocument.attachmentTypeInfo;
    delete clonedDocument.createdOn;
    delete clonedDocument.creatorInfo;
    delete clonedDocument.ouInfo;
    delete clonedDocument.required;
    delete clonedDocument.langService;

    clonedDocument.denormalizeItemId && clonedDocument.denormalizeItemId();

    delete clonedDocument.gridName
    if (!clonedDocument.description) {
      delete clonedDocument.description;
    }
    content ? formData.append('content', content) : null;
    return this.http.post<FileNetDocument>(this._getURLSegment() + '/' + profileId + '/document', formData, {
      params: new HttpParams({ fromObject: clonedDocument as any }),
      reportProgress: true,
      observe: 'events'
      }).pipe(
        filter(event => {
        if (event.type === HttpEventType.UploadProgress && progressCallback && typeof event.total !== 'undefined') {
        progressCallback(Math.floor(event.loaded * 100 / event.total));
      }
        return event.type === HttpEventType.Response;
      }),
        map<any, FileNetDocument>((response: any) => {
        return document.clone(response.body.rs) as FileNetDocument;
      })
    );
  }

}
