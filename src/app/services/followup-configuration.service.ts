import {ComponentType} from '@angular/cdk/portal';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {
  FollowupConfigurationPopupComponent
} from '@app/administration/popups/followup-configuration-popup/followup-configuration-popup.component';
import {BackendWithDialogOperationsGenericService} from '@app/generics/backend-with-dialog-operations-generic-service';
import {FollowupConfigurationInterceptor} from '@app/model-interceptors/followup-configuration-interceptor';
import {FollowupConfiguration} from '@app/models/followup-configuration';
import {DialogService} from './dialog.service';
import {FactoryService} from './factory.service';
import {UrlService} from './url.service';
import {Observable} from 'rxjs';
import {IFollowupCriteria} from '@app/interfaces/ifollowup-criteria';
import {Generator} from '@app/decorators/generator';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {IDialogData} from '@app/interfaces/i-dialog-data';

@Injectable({
  providedIn: 'root',
})
export class FollowupConfigurationService extends BackendWithDialogOperationsGenericService<FollowupConfiguration> {
  interceptor: FollowupConfigurationInterceptor = new FollowupConfigurationInterceptor();

  list: FollowupConfiguration[] = [];

  constructor(public dialog: DialogService, public http: HttpClient, private urlService: UrlService,
  ) {
    super();
    FactoryService.registerService('FollowupConfigurationService', this);

  }

  _getDialogComponent(): ComponentType<any> {
    return FollowupConfigurationPopupComponent;
  }

  _getSendInterceptor() {
    return this.interceptor.send;
  }

  _getReceiveInterceptor() {
    return this.interceptor.receive;
  }

  _getModel() {
    return FollowupConfiguration;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.FOLLOWUP_CONFIGURATION;
  }

  getByCaseType(caseTypeId: number): Observable<FollowupConfiguration[]> {
    return this.getByCriteria({'case-type': caseTypeId});
  }

  @Generator(undefined, true, {interceptReceive: (new FollowupConfigurationInterceptor().receive), property: 'rs'})
  getByCriteria(criteria: Partial<IFollowupCriteria>) {
    return this.http.get<FollowupConfiguration[]>(this._getServiceURL() + '/criteria', {
      params: new HttpParams({fromObject: criteria})
    });
  }

  private getAddDialogWithDefaults(model: FollowupConfiguration, operation: OperationTypes, serviceId: number, caseType: number): DialogRef {
    return this.dialog.show<IDialogData<FollowupConfiguration>>(this._getDialogComponent(), {
      operation,
      model,
      serviceId: serviceId,
      caseType: caseType
    })
  }

  addDialogWithDefaults(serviceId: number, caseType: number): DialogRef | Observable<DialogRef> {
    return this.getAddDialogWithDefaults(new (this._getModel() as { new(...args: any[]): FollowupConfiguration }), OperationTypes.CREATE,
      serviceId, caseType);
  }
}

