import {Injectable} from '@angular/core';
import {BackendGenericService} from '../generics/backend-generic-service';
import {ServiceData} from '../models/service-data';
import {HttpClient} from '@angular/common/http';
import {FactoryService} from './factory.service';
import {ServiceDataInterceptor} from '../model-interceptors/service-data-interceptor';
import {UrlService} from './url.service';
import {DialogRef} from '../shared/models/dialog-ref';
import {IDialogData} from '../interfaces/i-dialog-data';
import {OperationTypes} from '../enums/operation-types.enum';
import {Observable, of} from 'rxjs';
import {DialogService} from './dialog.service';
import {ServiceDataPopupComponent} from '../administration/popups/service-data-popup/service-data-popup.component';
import {map, switchMap} from 'rxjs/operators';
import {Generator} from '../decorators/generator';

@Injectable({
  providedIn: 'root'
})
export class ServiceDataService extends BackendGenericService<ServiceData> {
  list!: ServiceData[];

  constructor(public http: HttpClient, private dialogService: DialogService,
              private urlService: UrlService) {
    super();
    FactoryService.registerService('ServiceDataService', this);
  }

  _getModel(): any {
    return ServiceData;
  }

  _getReceiveInterceptor(): any {
    return ServiceDataInterceptor.receive;
  }

  _getSendInterceptor(): any {
    return ServiceDataInterceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.SERVICE_DATA;
  }

  @Generator(undefined, true, {property: 'rs'})
  loadComposite(): Observable<ServiceData[]> {
    return this.http.get<ServiceData[]>(this._getServiceURL() + '/composite');
  }

  openCreateDialog(): DialogRef {
    return this.dialogService.show<IDialogData<ServiceData>>(ServiceDataPopupComponent, {
      model: new ServiceData(),
      operation: OperationTypes.CREATE,
      list: this.list
    });
  }

  openUpdateDialog(modelId: number): Observable<DialogRef> {
    return this.getById(modelId).pipe(
      switchMap((serviceData: ServiceData) => {
        return of(this.dialogService.show<IDialogData<ServiceData>>(ServiceDataPopupComponent, {
          model: serviceData,
          operation: OperationTypes.UPDATE,
          list: this.list
        }));
      })
    );
  }

  @Generator(undefined, true)
  private _loadByCaseType(caseType: number): Observable<ServiceData[]> {
    return this.http.get<ServiceData[]>(this._getServiceURL() + '/caseType/' + caseType);
  }

  loadByCaseType(caseType: number): Observable<ServiceData> {
    return this._loadByCaseType(caseType)
      .pipe(
        map(item => item[0])
      );
  }
}
