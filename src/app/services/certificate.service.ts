import {Injectable} from '@angular/core';
import {BackendWithDialogOperationsGenericService} from '@app/generics/backend-with-dialog-operations-generic-service';
import {Certificate} from '@app/models/certificate';
import {ComponentType} from '@angular/cdk/portal';
import {CertificateInterceptor} from '@app/model-interceptors/certificate-interceptor';
import {HttpClient} from '@angular/common/http';
import {UrlService} from '@app/services/url.service';
import {DialogService} from '@app/services/dialog.service';
import {DomSanitizer} from '@angular/platform-browser';
import {FactoryService} from '@app/services/factory.service';
import {CertificatePopupComponent} from '@app/training-services/popups/certificate-popup/certificate-popup.component';
import {Observable, of} from 'rxjs';
import {catchError, exhaustMap, map, switchMap} from 'rxjs/operators';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {BlobModel} from '@app/models/blob-model';
import {ViewDocumentPopupComponent} from '@app/training-services/popups/view-document-popup/view-document-popup.component';

@Injectable({
  providedIn: 'root'
})
export class CertificateService extends BackendWithDialogOperationsGenericService<Certificate> {
  list: Certificate[] = [];
  interceptor: CertificateInterceptor = new CertificateInterceptor();

  constructor(public http: HttpClient,
              private urlService: UrlService,
              public dialog: DialogService,
              private domSanitizer: DomSanitizer,
              private dialogService: DialogService) {
    super();
    FactoryService.registerService('CertificateService', this);
  }

  createTemplate(certificate: Certificate): Observable<string> {
    const formData = new FormData();
    formData.append('content', certificate.file);
    formData.append('entity', JSON.stringify({vsId: certificate.vsId, documentTitle: certificate.documentTitle, status: certificate.status}));
    return this.http.post<string>(this._getServiceURL(), formData).pipe(
      map((response: any) => {
        return response.rs;
      })
    );
  }

  updateTemplate(certificate: Certificate): Observable<string> {
    const formData = new FormData();
    formData.append('content', certificate.file);
    formData.append('entity', JSON.stringify({vsId: certificate.vsId, documentTitle: certificate.documentTitle, status: certificate.status}));
    return this.http.post<string>(this._getServiceURL() + '/update', formData).pipe(
      map((response: any) => {
        return response.rs;
      })
    );
  }

  private getTemplateDialog(model: Certificate, operation: OperationTypes): DialogRef {
    return this.dialog.show<IDialogData<Certificate>>(this._getDialogComponent(), {
      operation,
      model
    })
  }

  editTemplateDialog(model: Certificate): Observable<DialogRef> {
    return of(model)
      .pipe(exhaustMap((model) => of(this.getTemplateDialog(model, OperationTypes.UPDATE))));
  }

  getTemplate(vsId: string): Observable<BlobModel> {
    return this.http.get(this._getServiceURL() + '/preview/content/' + vsId, {
      responseType : 'blob',
      observe : 'body'
    }).pipe(
      map(blob => new BlobModel(blob , this.domSanitizer ),
        catchError(_ => {
          return of(new BlobModel(new Blob([], {type: 'error'}), this.domSanitizer));
        })));
  }

  viewTemplateDialog(certificate: Certificate): Observable<DialogRef> {
    return this.getTemplate(certificate.vsId).pipe(
      switchMap((blobModel: BlobModel) => {
        return of(this.dialogService.show<IDialogData<Certificate>>(ViewDocumentPopupComponent, {
          model: certificate,
          operation: OperationTypes.UPDATE,
          blob: blobModel,
          titleHasPlaceHolder: true,
          titleKey: 'preview_template_x',
          modelPropName: 'documentTitle'
        }));
      })
    );
  }

  deleteTemplate(vsId: string): Observable<boolean> {
    return this.http.delete<boolean>(this._getServiceURL() + '/' + vsId);
  }

  _getDialogComponent(): ComponentType<any> {
    return CertificatePopupComponent;
  }

  _getModel(): any {
    return Certificate
  }

  _getReceiveInterceptor(): any {
    return this.interceptor.receive;
  }

  _getSendInterceptor(): any {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.CERTIFICATE_TEMPLATE;
  }
}
