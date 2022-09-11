import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CastResponse, CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { CharityReport } from '@app/models/charity-report';
import { Pagination } from '@app/models/pagination';
import { DialogService } from './dialog.service';
import { FactoryService } from './factory.service';
import { UrlService } from './url.service';

@CastResponseContainer({
  $default: {
    model: () => CharityReport,
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => CharityReport },
  },
})
@Injectable({
  providedIn: 'root',
})
export class CharityReportService extends CrudWithDialogGenericService<CharityReport> {
  list: CharityReport[] = [];
  constructor(public dialog: DialogService, public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('CharityReportService', this);
  }
  _getDialogComponent(): ComponentType<any> {
    throw new Error('Method not implemented.');
  }
  _getModel(): new () => CharityReport {
    return CharityReport;
  }
  _getServiceURL(): string {
    return this.urlService.URLS.CHARITY_REPORT;
  }

  @CastResponse(undefined)
  getByCharityId(id: number) {
    return this.http.get<CharityReport[]>(this._getServiceURL() + '/charity/' + id)
  }
}
