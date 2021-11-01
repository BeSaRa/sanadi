import {HttpClient, HttpEventType, HttpParams} from '@angular/common/http';
import {FileNetDocument} from '../models/file-net-document';
import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {Generator} from '../decorators/generator';
import {BackendServiceModelInterface} from '../interfaces/backend-service-model-interface';
import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {FileNetDocumentInterceptor} from '../model-interceptors/file-net-document-interceptor';
import {BlobModel} from '../models/blob-model';
import {DialogRef} from '../shared/models/dialog-ref';
import {DialogService} from './dialog.service';
import {ViewDocumentPopupComponent} from '../shared/popups/view-document-popup/view-document-popup.component';
import {DomSanitizer} from '@angular/platform-browser';

export class DocumentService implements Pick<BackendServiceModelInterface<FileNetDocument>, '_getModel' | '_getInterceptor'> {
  private interceptor = new FileNetDocumentInterceptor();

  constructor(private service: {
    http: HttpClient,
    _getServiceURL(): string,
    dialog: DialogService,
    domSanitizer: DomSanitizer
  }) {

  }

  _getModel() {
    return FileNetDocument;
  }

  _getInterceptor(): Partial<IModelInterceptor<FileNetDocument>> {
    return this.interceptor;
  }

  addSingleDocument(caseId: string,
                    document: FileNetDocument,
                    progressCallback?: (percentage: number) => void): Observable<FileNetDocument> {

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
    if (!clonedDocument.description) {
      delete clonedDocument.description;
    }
    content ? formData.append('content', content) : null;
    return this.service.http.post<any>(this.service._getServiceURL() + '/' + caseId + '/document', formData, {
      params: new HttpParams({fromObject: clonedDocument as any}),
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

  addBulkDocuments(caseId: string,
                   document: FileNetDocument,
                   files: FileList,
                   progressCallback?: (percentage: number) => void): Observable<FileNetDocument[]> {

    const clonedDocument = document.clone();
    const formData = new FormData();
    delete clonedDocument.files;
    for (let i = 0; i < files.length; i++) {
      formData.append('content', files.item(i)!);
    }
    delete clonedDocument.dialog;
    delete clonedDocument.required;
    clonedDocument.attachmentTypeId = 1;
    return this.service.http.post(this.service._getServiceURL() + '/' + caseId + '/document/bulk', formData, {
      params: new HttpParams({fromObject: clonedDocument as any}),
      reportProgress: true,
      observe: 'events'
    }).pipe(
      filter(event => {
        if (event.type === HttpEventType.UploadProgress && progressCallback && typeof event.total !== 'undefined') {
          progressCallback(Math.floor(event.loaded * 100 / event.total));
        }
        return event.type === HttpEventType.Response;
      }),
      map((response: any) => {
        const result: Record<string, FileNetDocument> = response.body.rs;
        return Object.values(result);
      })
    );
  }

  addDocument(caseId: string,
              document: FileNetDocument,
              progressCallback?: (percentage: number) => void): Observable<Partial<FileNetDocument>> | Observable<Partial<FileNetDocument>[]> {
    const files = document.files!;
    return files.length > 1 ? this.addBulkDocuments(caseId, document, files, progressCallback) : this.addSingleDocument(caseId, document, progressCallback);
  }

  @Generator(FileNetDocument, true, {property: 'rs'})
  private _loadDocuments(caseId: string): Observable<FileNetDocument[]> {
    return this.service.http.get<FileNetDocument[]>(this.service._getServiceURL() + '/' + caseId + '/folder/contained-documents');
  }

  loadDocuments(caseId: string): Observable<FileNetDocument[]> {
    return this._loadDocuments(caseId);
  }

  deleteDocument(docId: string): Observable<boolean> {
    return this.service.http.delete<boolean>(this.service._getServiceURL() + '/document/' + docId);
  }

  downloadDocument(docId: string): Observable<BlobModel> {
    return this.service.http.get(this.service._getServiceURL() + '/document/' + docId + '/download', {
      observe: 'body',
      responseType: 'blob'
    }).pipe(map(blob => new BlobModel(blob, this.service.domSanitizer)));
  }

  viewDocument(model: BlobModel, document: FileNetDocument): DialogRef {
    return this.service.dialog.show(ViewDocumentPopupComponent, {
      model: document,
      blob: model
    }, {
      escToClose: true
    });
  }

  deleteBulkDocument(documentIds: string[]) {
    return this.service.http.request('DELETE', this.service._getServiceURL() + '/document/bulk', {
      params: {
        docIds: documentIds,
      }
    });
  }
}
