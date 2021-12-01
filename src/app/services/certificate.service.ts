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
