import {HttpClient, HttpEventType, HttpParams} from '@angular/common/http';
import {FileNetDocument} from '@models/file-net-document';
import {Observable} from 'rxjs';
import {concatMap, filter, map, switchMap} from 'rxjs/operators';
import {BlobModel} from '@models/blob-model';
import {DialogRef} from '../shared/models/dialog-ref';
import {DialogService} from './dialog.service';
import {ViewDocumentPopupComponent} from '../shared/popups/view-document-popup/view-document-popup.component';
import {DomSanitizer} from '@angular/platform-browser';
import {CastResponse} from "@decorators/cast-response";
import {OperationTypes} from '@enums/operation-types.enum';

export class DocumentService {
  constructor(private service: {
    http: HttpClient,
    _getURLSegment(): string,
    dialog: DialogService,
    domSanitizer: DomSanitizer
  }) {

  }

  @CastResponse(() => FileNetDocument, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _saveDocument(saveType: OperationTypes, caseId: string, document: FileNetDocument, progressCallback?: (percentage: number) => void): Observable<FileNetDocument> {
    const clonedDocument = document.clone() as Partial<FileNetDocument>;
    const content = clonedDocument.files?.item(0);
    const formData = new FormData();
    delete clonedDocument.files;
    delete clonedDocument.dialog;
    delete clonedDocument.searchFields;
    delete clonedDocument.employeeService;
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
    let requestUrl = this.service._getURLSegment() + '/' + caseId + '/document';
    if (saveType === OperationTypes.UPDATE) {
      requestUrl = this.service._getURLSegment() + '/' + caseId + '/update-document';
    }
    return this.service.http.post<FileNetDocument>(requestUrl, formData, {
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

  addSingleDocument(caseId: string,
                    document: FileNetDocument,
                    progressCallback?: (percentage: number) => void): Observable<FileNetDocument> {

    return this._saveDocument(OperationTypes.CREATE, caseId, document, progressCallback);
  }

  updateSingleDocument(caseId: string,
                       document: FileNetDocument,
                       progressCallback?: (percentage: number) => void): Observable<FileNetDocument> {
    return this.deleteDocument(document.id)
    .pipe(
      switchMap(_=> this._saveDocument(OperationTypes.CREATE, caseId, document, progressCallback))
    )                        
  }

  addBulkDocuments(caseId: string,
                   document: FileNetDocument,
                   files: FileList,
                   progressCallback?: (percentage: number) => void): Observable<FileNetDocument[]> {

    const clonedDocument = document.clone() as Partial<FileNetDocument>;
    const formData = new FormData();
    delete clonedDocument.files;
    for (let i = 0; i < files.length; i++) {
      formData.append('content', files.item(i)!);
    }
    delete clonedDocument.dialog;
    delete clonedDocument.required;
    delete clonedDocument.langService;
    delete clonedDocument.employeeService;
    delete clonedDocument.searchFields;
    clonedDocument.attachmentTypeId = 1;
    return this.service.http.post(this.service._getURLSegment() + '/' + caseId + '/document/bulk', formData, {
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

  @CastResponse(() => FileNetDocument, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _loadDocuments(caseId: string): Observable<FileNetDocument[]> {
    return this.service.http.get<FileNetDocument[]>(this.service._getURLSegment() + '/' + caseId + '/folder/contained-documents');
  }

  loadDocuments(caseId: string): Observable<FileNetDocument[]> {
    return this._loadDocuments(caseId);
  }

  deleteDocument(docId: string): Observable<boolean> {
    return this.service.http.delete<boolean>(this.service._getURLSegment() + '/document/' + docId);
  }

  downloadDocument(docId: string): Observable<BlobModel> {
    return this.service.http.get(this.service._getURLSegment() + '/document/' + docId + '/download', {
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
    return this.service.http.request('DELETE', this.service._getURLSegment() + '/document/bulk', {
      params: {
        docIds: documentIds,
      }
    });
  }
}
