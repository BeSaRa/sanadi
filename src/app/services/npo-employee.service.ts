import { CharityBranch } from './../models/charity-branch';
import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CastResponse, CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { NpoEmployee } from '@app/models/npo-employee';
import { Pagination } from '@app/models/pagination';
import { DialogService } from './dialog.service';
import { UrlService } from './url.service';

@CastResponseContainer({
  $default: {
    model: () => NpoEmployee,
  },
  $charityBranch: {
    model: () => CharityBranch,
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => NpoEmployee },
  },
})
@Injectable({
  providedIn: 'root'
})
export class NpoEmployeeService extends CrudWithDialogGenericService<NpoEmployee> {
  list: NpoEmployee[] = [];

  constructor(
    public dialog: DialogService,
    public http: HttpClient,
    private urlService: UrlService
  ) {
    super();
  }
  _getServiceURL(): string {
    return this.urlService.URLS.NPO_EMPLOYEE;
  }
  _getDialogComponent(): ComponentType<any> {
    throw new Error('asd');
  }
  _getModel(): new () => NpoEmployee {
    return NpoEmployee;
  }

  @CastResponse(undefined)
  getByOrganizationId(id: number) {
    return this.http.get<NpoEmployee[]>(this._getServiceURL() + '/org/' + id);
  }
  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$charityBranch'
  })
  getCharityHeadQuarterBranch() {
    return this.http.get<CharityBranch[]>(this._getServiceURL() + '/charity/branch/headquarters');
  }
}
