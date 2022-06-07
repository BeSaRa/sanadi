import {Injectable} from '@angular/core';
import {CastResponseContainer} from '@decorators/cast-response';
import {Donor} from '@app/models/donor';
import {CrudWithDialogGenericService} from '@app/generics/crud-with-dialog-generic-service';
import {HttpClient} from '@angular/common/http';
import {UrlService} from '@services/url.service';
import {DialogService} from '@services/dialog.service';
import {FactoryService} from '@services/factory.service';
import {ComponentType} from '@angular/cdk/portal';
import {DonorPopupComponent} from '@app/administration/popups/donor-popup/donor-popup.component';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {IDialogData} from '@contracts/i-dialog-data';
import {OperationTypes} from '@app/enums/operation-types.enum';

@CastResponseContainer({
  $default: {
    model: () => Donor
  }
})
@Injectable({
  providedIn: 'root'
})
export class DonorService extends CrudWithDialogGenericService<Donor> {
  list: Donor[] = [];

  constructor(public http: HttpClient,
              private urlService: UrlService,
              public dialog: DialogService) {
    super();
    FactoryService.registerService('DonorService', this);
  }

  _getModel(): new () => Donor {
    return Donor;
  }

  _getDialogComponent(): ComponentType<any> {
    return DonorPopupComponent;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.DONOR;
  }

  updateStatus(donorId: number, newStatus: CommonStatusEnum) {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activate(donorId) : this._deactivate(donorId);
  }

  updateStatusBulk(recordIds: number[], newStatus: CommonStatusEnum): Observable<any> {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activateBulk(recordIds) : this._deactivateBulk(recordIds);
  }

  private _activate(donorId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + donorId + '/activate', {});
  }

  private _deactivate(donorId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + donorId + '/de-activate', {});
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
      switchMap((donor: Donor) => {
        return of(this.dialog.show<IDialogData<Donor>>(DonorPopupComponent, {
          model: donor,
          operation: OperationTypes.VIEW
        }));
      })
    );
  }

}
