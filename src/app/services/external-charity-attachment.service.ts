import { inject, Injectable } from "@angular/core";
import { FactoryService } from "./factory.service";
import { UrlService } from "./url.service";
import { FileNetDocument } from "@app/models/file-net-document";
import { map, Observable, of } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { BlobModel } from "@app/models/blob-model";
import { DomSanitizer } from "@angular/platform-browser";
import { DialogService } from "./dialog.service";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { ViewDocumentPopupComponent } from "@app/shared/popups/view-document-popup/view-document-popup.component";

@Injectable({
    providedIn: 'root'
})
export class ExternalCharityAttachmentsService {

    urlService: UrlService = inject(UrlService);
    http: HttpClient = inject(HttpClient);
    domSanitizer = inject(DomSanitizer);
    dialog = inject(DialogService);

    _getServiceURL(): string {
        return this.urlService.URLS.EXTERNAL_CHARITY_ATTACHMENT;
    }
    constructor() {
        FactoryService.registerService('ExternalCharityAttachmentsService', this);
    }

    addDocument(requestId:number,document: FileNetDocument): Observable<FileNetDocument> {
        return this.http.post<{rs:FileNetDocument}>(this._getServiceURL() + '/request',
            this._getFormData(document),
            {
                params: new HttpParams({ fromObject: <any>{...this._getQueryParams(document),requestId} }),
            })
            .pipe( map(result=>result.rs))
    }
    updateDocument(requestId:number,document: FileNetDocument): Observable<FileNetDocument> {
        return this.http.post<{rs:FileNetDocument}>(this._getServiceURL() + '/request/update',
            this._getFormData(document),
            {
                params: new HttpParams({ fromObject: <any>{...this._getQueryParams(document),requestId} }),
            })
            .pipe(map(result=>result.rs))
    }
    deleteDocument(vsId: string): Observable<FileNetDocument> {
        return this.http.delete<FileNetDocument>(this._getServiceURL() + `/${vsId}`)
    }

    private _getFormData(document: FileNetDocument) {
        const formData = new FormData();
        if (!!document.files?.item(0)) {
            formData.append('content', document.files.item(0)!);
        }
        return formData
    }
    private _getQueryParams(document: FileNetDocument) {
        const clonedDocument = document.clone() as Partial<FileNetDocument>;
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
        return clonedDocument
    }

    downloadDocument(vsId: string): Observable<BlobModel> {
        return this.http.get(this._getServiceURL() + `/content/${vsId}`, {
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
}