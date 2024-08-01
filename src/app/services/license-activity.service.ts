import { ComponentType } from "@angular/cdk/portal";
import { HttpClient, HttpEventType, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { CastResponse, CastResponseContainer } from "@app/decorators/decorators/cast-response";
import { HasInterception, InterceptParam } from "@app/decorators/decorators/intercept-model";
import { OperationTypes } from "@app/enums/operation-types.enum";
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import { IDialogData } from "@app/interfaces/i-dialog-data";
import { BlobModel } from "@app/models/blob-model";
import { FileNetDocument } from "@app/models/file-net-document";
import { InspectionLog } from "@app/models/inspection-log";
import { LicenseActivity } from "@app/models/license-activity";
import { Pagination } from "@app/models/pagination";
import { ProposedInspection } from "@app/models/proposed-inspection";
import { InspectionLogsPopupComponent } from "@app/modules/services/inspection/popups/inspection-logs-popup/inspection-logs-popup.component";
import { LicenseActivityCompletePopupComponent } from "@app/modules/services/inspection/popups/license-activity-complete-popup/license-activity-complete-popup.component";
import { LicenseActivityPopupComponent } from "@app/modules/services/inspection/popups/license-activity-popup/license-activity-popup.component";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { ViewDocumentPopupComponent } from "@app/shared/popups/view-document-popup/view-document-popup.component";
import { Observable, of } from "rxjs";
import { filter, map, switchMap, take, tap } from "rxjs/operators";
import { DialogService } from "./dialog.service";
import { FactoryService } from "./factory.service";
import { UrlService } from "./url.service";

@CastResponseContainer({
  $default: {
    model: () => LicenseActivity,
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => ProposedInspection }
  }
})
@Injectable({
  providedIn: 'root'
})
export class LicenseActivityService extends CrudWithDialogGenericService<LicenseActivity> {

  list: LicenseActivity[] = [];

  constructor(public http: HttpClient,
    private urlService: UrlService,
    public dialog: DialogService,
    public domSanitizer: DomSanitizer) {
    super();
    FactoryService.registerService('LicenseActivityService', this);
  }

  _getModel(): new () => LicenseActivity {
    return LicenseActivity;
  }

  _getDialogComponent(): ComponentType<any> {
    return LicenseActivityPopupComponent;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.License_Activity;
  }


  openViewDialog(modelId: number): Observable<DialogRef> {
    return this.getByIdComposite(modelId).pipe(
      switchMap((LicenseActivity: LicenseActivity) => {
        return of(this.dialog.show<IDialogData<LicenseActivity>>(LicenseActivityPopupComponent, {
          model: LicenseActivity,
          operation: OperationTypes.VIEW
        }));
      })
    );
  }
  openCompleteDialog(model: LicenseActivity): DialogRef {
    return this.dialog.show<IDialogData<LicenseActivity>>(LicenseActivityCompletePopupComponent, {
      model: new LicenseActivity().clone(model),
      operation: OperationTypes.CREATE
    });
  }
  @HasInterception
  @CastResponse(undefined)
  save(@InterceptParam() model: LicenseActivity, actualTask: number): Observable<LicenseActivity> {
    return this.http.post<LicenseActivity>(this._getServiceURL() + '/save', model, {
      params: new HttpParams({
        fromObject: {
          actualTask
        }
      })
    });
  }
  @HasInterception
  @CastResponse(undefined)
  updateLicense
    (@InterceptParam() model: LicenseActivity, actualTask: number): Observable<LicenseActivity> {
    return this.http.put<LicenseActivity>(this._getServiceURL() + '/update', model, {
      params: new HttpParams({
        fromObject: {
          actualTask
        }
      })
    });
  }



  private prepareDocument(document: FileNetDocument) {
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
    return { formData: formData, clonedDocument: clonedDocument }
  }

  @CastResponse(() => FileNetDocument, {
    fallback: '$default',
    unwrap: 'rs'
  })
  saveDocument(taskFolderId: string, taskId: number, document: FileNetDocument, progressCallback?: (percentage: number) => void): Observable<FileNetDocument> {

    const { formData, clonedDocument } = this.prepareDocument(document);
    return this.http.post<FileNetDocument>(this._getServiceURL() + '/document', formData, {
      params: new HttpParams({
        fromObject: {
          ...clonedDocument as any,
          taskFolderId,
          taskId

        },

      }),
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
  @CastResponse(() => FileNetDocument, {
    fallback: '$default',
    unwrap: 'rs'
  })
  updateDocument(folderId: string, taskId: number, document: FileNetDocument, progressCallback?: (percentage: number) => void): Observable<FileNetDocument> {

    const { formData, clonedDocument } = this.prepareDocument(document);
    return this.http.post<FileNetDocument>(this._getServiceURL() + '/update-document', formData, {
      params: new HttpParams({
        fromObject: {
          ...clonedDocument as any,
          folderId,
          taskId

        },

      }),
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

  
  @HasInterception
  @CastResponse(undefined)
  complete(@InterceptParam() model: LicenseActivity): Observable<LicenseActivity> {
    const params = new HttpParams({
      fromObject: {
        status: model.status,
        comment: model.comment
      }
    })
    return this.http.post<LicenseActivity>(this._getServiceURL() + `/complete-activity/${model.id}`, {}, {
      params: params
    });
  }
  downloadDocument(docId: string): Observable<BlobModel> {
    return this.http.get(this._getServiceURL() + '/document/' + docId + '/download', {
      observe: 'body',
      responseType: 'blob'
    }).pipe(map(blob => new BlobModel(blob, this.domSanitizer)));
  }

  viewDocument(model: BlobModel, document: FileNetDocument): DialogRef {
    return this.dialog.show(ViewDocumentPopupComponent, {
      model: document,
      blob: model
    }, {
      escToClose: true
    });
  }
  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  getHistory(licenseNumber: string) {
    return this.http.get<InspectionLog[]>(this._getServiceURL() + '/license-history',
      {
        params: new HttpParams({
          fromObject: {
            licenseNumber
          }
        })
      })

  }
}
