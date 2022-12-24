import {Injectable} from '@angular/core';
import {DeductionRatioItem} from "@app/models/deduction-ratio-item";
import {CrudWithDialogGenericService} from "@app/generics/crud-with-dialog-generic-service";
import {ComponentType} from '@angular/cdk/portal';
import {HttpClient} from '@angular/common/http';
import {DialogService} from './dialog.service';
import {UrlService} from "@services/url.service";
import {FactoryService} from "@services/factory.service";
import { Observable, of } from 'rxjs';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { map, switchMap } from 'rxjs/operators';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { Pagination } from '@app/models/pagination';
import { DeductionRatioPopupComponent } from '@app/administration/popups/deduction-ratio-popup/deduction-ratio-popup.component';


@CastResponseContainer({
  $default: {
    model: () => DeductionRatioItem
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => DeductionRatioItem }
  }
})
@Injectable({
  providedIn: 'root'
})
export class DeductionRatioItemService extends CrudWithDialogGenericService<DeductionRatioItem> {
  list: DeductionRatioItem[] = [];

  constructor(public http: HttpClient, public urlService: UrlService, public dialog: DialogService) {
    super()
    FactoryService.registerService('DeductionRatioItemService', this)
  }

  _getDialogComponent(): ComponentType<any> {
    return DeductionRatioPopupComponent
  }

  _getModel(): new () => DeductionRatioItem {
    return DeductionRatioItem
  }

  _getServiceURL(): string {
    return this.urlService.URLS.DEDUCTION_RATIO_ITEM
  }

  updateStatus(deductionRatioId: number, newStatus: CommonStatusEnum) {
    
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activate(deductionRatioId) : this._deactivate(deductionRatioId);
  }

  updateStatusBulk(recordIds: number[], newStatus: CommonStatusEnum): Observable<any> {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activateBulk(recordIds) : this._deactivateBulk(recordIds);
  }

  private _activate(deductionRatioId: number): Observable<any> {  
    return this.http.put<any>(this._getServiceURL() + '/' + deductionRatioId + '/activate', {});
  }
  
  private _deactivate(deductionRatioId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + deductionRatioId + '/de-activate', {});
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
      switchMap((deductionRatio: DeductionRatioItem) => {
        return of(this.dialog.show<IDialogData<DeductionRatioItem>>(DeductionRatioPopupComponent, {
          model: deductionRatio,
          operation: OperationTypes.VIEW
        }));
      })
    );
  }
}

