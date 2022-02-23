import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {InternalDepartment} from '../models/internal-department';
import {UrlService} from './url.service';
import {Observable, of} from 'rxjs';
import {InternalDepartmentTypes} from '../enums/internal-department-types';
import {Generator} from '../decorators/generator';
import {InternalDepartmentInterceptor} from '../model-interceptors/internal-department-interceptor';
import {BackendWithDialogOperationsGenericService} from '@app/generics/backend-with-dialog-operations-generic-service';
import {DialogService} from '@app/services/dialog.service';
import {ComponentType} from '@angular/cdk/portal';
import {InternalDepartmentPopupComponent} from '@app/administration/popups/internal-department-popup/internal-department-popup.component';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {catchError, map, switchMap} from 'rxjs/operators';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {FactoryService} from '@app/services/factory.service';
import {BlobModel} from '@app/models/blob-model';
import {DomSanitizer} from '@angular/platform-browser';
import {CommonStatusEnum} from '@app/enums/common-status.enum';

@Injectable({
  providedIn: 'root'
})
export class InternalDepartmentService extends BackendWithDialogOperationsGenericService<InternalDepartment> {
  list!: InternalDepartment[];
  interceptor: InternalDepartmentInterceptor = new InternalDepartmentInterceptor();

  constructor(public http: HttpClient,private domSanitizer: DomSanitizer ,private urlService: UrlService, public dialog: DialogService) {
    super();
    FactoryService.registerService('InternalDepartmentService', this);
  }

  @Generator(InternalDepartment, true, {property: 'rs'})
  private _loadDepartmentsByType(type: InternalDepartmentTypes): Observable<InternalDepartment[]> {
    return this.http.get<InternalDepartment[]>(this._getServiceURL() + '/type/' + type);
  }

  loadDepsByType(type: InternalDepartmentTypes): Observable<InternalDepartment[]> {
    return this._loadDepartmentsByType(type);
  }

  loadDepartments(): Observable<InternalDepartment[]> {
    return this.loadDepsByType(InternalDepartmentTypes.ADMINISTRATION);
  }

  loadSections(): Observable<InternalDepartment[]> {
    return this.loadDepsByType(InternalDepartmentTypes.SECTION);
  }

  loadOffices(): Observable<InternalDepartment[]> {
    return this.loadDepsByType(InternalDepartmentTypes.OFFICE);
  }

  loadCommittees(): Observable<InternalDepartment[]> {
    return this.loadDepsByType(InternalDepartmentTypes.COMMITTEE);
  }

  _getModel() {
    return InternalDepartment;
  }

  _getSendInterceptor() {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.INTERNAL_DEPARTMENT;
  }

  _getReceiveInterceptor() {
    return this.interceptor.receive;
  }

  _getDialogComponent(): ComponentType<any> {
    return InternalDepartmentPopupComponent;
  };

  openViewDialog(modelId: number): Observable<DialogRef> {
    return this.getById(modelId).pipe(
      switchMap((internalDepartment: InternalDepartment) => {
        return of(this.dialog.show<IDialogData<InternalDepartment>>(InternalDepartmentPopupComponent, {
          model: internalDepartment,
          operation: OperationTypes.VIEW
        }));
      })
    );
  }

  updateStamp(departmentId: number, file: File): Observable<boolean> {
    let form = new FormData();
    form.append('file', file);
    return this.http.post<boolean>(this._getServiceURL() + '/stamp?departmentId=' + departmentId, form);
  }

  getStamp(departmentId: number): Observable<BlobModel> {
    return this.http.post(this._getServiceURL() + '/stamp/content', {departmentId: departmentId},{
      responseType : 'blob',
      observe : 'body'
    }).pipe(
      map(blob => new BlobModel(blob , this.domSanitizer ),
      catchError(_ => {
        return of(new BlobModel(new Blob([], {type: 'error'}), this.domSanitizer));
      })));
  }

  updateStatus(departmentId: number, newStatus: CommonStatusEnum) {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activate(departmentId) : this._deactivate(departmentId);
  }

  private _activate(departmentId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + departmentId + '/activate', {});
  }

  private _deactivate(departmentId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + departmentId + '/de-activate', {});
  }
}
