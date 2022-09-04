import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { Pagination } from '@app/models/pagination';
import { RealBeneficiary } from '@app/models/real-beneficiary';
import { DialogService } from './dialog.service';
import { FactoryService } from './factory.service';
import { UrlService } from './url.service';

@CastResponseContainer({
  $default: {
    model: () => RealBeneficiary,
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => RealBeneficiary },
  },
})
@Injectable({
  providedIn: 'root',
})
export class RealBeneficiaryService extends CrudWithDialogGenericService<RealBeneficiary> {
  list: RealBeneficiary[] = [];
  constructor(public dialog: DialogService, public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('RealBeneficiaryService', this);
  }
  _getDialogComponent(): ComponentType<any> {
    throw new Error('Method not implemented.');
  }
  _getModel(): new () => RealBeneficiary {
    return RealBeneficiary;
  }
  _getServiceURL(): string {
    return this.urlService.URLS.REAL_BENEFECIARY;
  }
  getRealBenficiaryOfCharity(id: number) {
    return this.http.get(this._getServiceURL + '/charity' + id);
  }

}
