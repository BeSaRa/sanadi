import { CastResponse } from "@app/decorators/decorators/cast-response";
import { DocumentService } from "./document.service";
import { FileNetDocument } from "@app/models/file-net-document";
import { Observable } from "rxjs";
import { HttpClient, HttpEventType, HttpParams } from "@angular/common/http";
import { DialogService } from "./dialog.service";
import { DomSanitizer } from "@angular/platform-browser";
import { OperationTypes } from "@app/enums/operation-types.enum";
import { filter, map } from "rxjs/operators";
import { ActualInspection } from "@app/models/actual-inspection";

export class InspectionDocumentService extends DocumentService {


  private _model?: ActualInspection

  setModel(model: ActualInspection) {
    this._model = model
  }
  constructor(private obj: {
    http: HttpClient,
    _getServiceURL(): string,
    dialog: DialogService,
    domSanitizer: DomSanitizer,
  }) {
    super({ ...obj, _getURLSegment: () => obj._getServiceURL() });

  }
  @CastResponse(() => FileNetDocument, {
    fallback: '$default',
    unwrap: 'rs'
  })
  loadDocuments(caseId: string): Observable<FileNetDocument[]> {
    return this.obj.http.get<FileNetDocument[]>(this.obj._getServiceURL() + '/folder/contained-documents/' + caseId);
  }

  addSingleDocument(caseId: string,
    document: FileNetDocument,
    progressCallback?: (percentage: number) => void): Observable<FileNetDocument> {

    return this._save(OperationTypes.CREATE, caseId, document, progressCallback);
  }
  @CastResponse(() => FileNetDocument, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _save(saveType: OperationTypes, caseId: string, document: FileNetDocument, progressCallback?: (percentage: number) => void): Observable<FileNetDocument> {
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
    let requestUrl = this.obj._getServiceURL() + '/document';
    if (saveType === OperationTypes.UPDATE) {
      requestUrl = this.obj._getServiceURL() + '/document';
    }
    return this.obj.http.post<FileNetDocument>(requestUrl, formData, {
      params: new HttpParams({ fromObject: { ...clonedDocument as any, taskId: caseId } }),
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
  deleteDocument(docId: string): Observable<boolean> {
    return this.obj.http.delete<boolean>(this.obj._getServiceURL() + '/document/' + docId, {
      params: new HttpParams({ fromObject: { taskId: `${this._model?.id}` } })
    });
  }
}