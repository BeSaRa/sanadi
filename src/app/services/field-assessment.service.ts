import {Injectable} from '@angular/core';
import {BackendWithDialogOperationsGenericService} from '@app/generics/backend-with-dialog-operations-generic-service';
import {FieldAssessment} from '@app/models/field-assessment';
import {FactoryService} from '@services/factory.service';
import {HttpClient} from '@angular/common/http';
import {UrlService} from '@services/url.service';
import {DialogService} from '@services/dialog.service';
import {ComponentType} from '@angular/cdk/portal';
import {FieldAssessmentInterceptor} from '@app/model-interceptors/field-assessment-interceptor';
import {FieldAssessmentPopupComponent} from '@app/administration/popups/field-assessment-popup/field-assessment-popup.component';
import {FieldAssessmentTypesEnum} from '@app/enums/field-assessment-types.enum';
import {Observable, of} from 'rxjs';
import {Generator} from '@decorators/generator';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {map, switchMap} from 'rxjs/operators';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {Donor} from '@app/models/donor';
import {IDialogData} from '@contracts/i-dialog-data';
import {DonorPopupComponent} from '@app/administration/popups/donor-popup/donor-popup.component';
import {OperationTypes} from '@app/enums/operation-types.enum';

@Injectable({
  providedIn: 'root'
})
export class FieldAssessmentService extends BackendWithDialogOperationsGenericService<FieldAssessment> {
  list!: FieldAssessment[];
  interceptor: FieldAssessmentInterceptor = new FieldAssessmentInterceptor();

  constructor(public http: HttpClient,
              private urlService: UrlService,
              public dialog: DialogService,) {
    super();
    FactoryService.registerService('FieldAssessmentService', this);
  }

  _getDialogComponent(): ComponentType<any> {
    return FieldAssessmentPopupComponent;
  }

  _getModel(): any {
    return FieldAssessment;
  }

  _getReceiveInterceptor(): any {
    return this.interceptor.receive;
  }

  _getSendInterceptor(): any {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.FIELD_ASSESSMENT;
  }

  @Generator(undefined, true, {property: 'rs'})
  private _loadByType(type: FieldAssessmentTypesEnum): Observable<FieldAssessment[]> {
    return this.http.get<FieldAssessment[]>(this._getServiceURL() + '/type/' + type);
  }

  loadByType(type: FieldAssessmentTypesEnum): Observable<FieldAssessment[]> {
    return this._loadByType(type);
  }

  updateStatus(recordId: number, newStatus: CommonStatusEnum) {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activate(recordId) : this._deactivate(recordId);
  }

  updateStatusBulk(recordIds: number[], newStatus: CommonStatusEnum): Observable<any> {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activateBulk(recordIds) : this._deactivateBulk(recordIds);
  }

  private _activate(recordId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + recordId + '/activate', {});
  }

  private _deactivate(recordId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + recordId + '/de-activate', {});
  }

  private _activateBulk(recordIds: number[]) {
    return this.http.put(this._getServiceURL() + '/bulk/activate', recordIds)
      .pipe(
        map((response: any) => {
          return response.rs;
        })
      );
  }

  private _deactivateBulk(recordIds: number[]) {
    return this.http.put(this._getServiceURL() + '/bulk/de-activate', recordIds)
      .pipe(
        map((response: any) => {
          return response.rs;
        })
      );
  }

  openViewDialog(modelId: number): Observable<DialogRef> {
    return this.getByIdComposite(modelId).pipe(
      switchMap((result: FieldAssessment) => {
        return of(this.dialog.show<IDialogData<FieldAssessment>>(FieldAssessmentPopupComponent, {
          model: result,
          operation: OperationTypes.VIEW
        }));
      })
    );
  }
}
