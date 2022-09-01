import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { CharityOrganization } from '@app/models/charity-organization';
import { Pagination } from '@app/models/pagination';
import { DialogService } from './dialog.service';
import { FactoryService } from './factory.service';
import { UrlService } from './url.service';

@CastResponseContainer({
  $default: {
    model: () => CharityOrganization,
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => CharityOrganization },
  },
})
@Injectable({
  providedIn: 'root',
})
export class CharityOrganizationService extends CrudWithDialogGenericService<CharityOrganization> {
  list: CharityOrganization[] = [];
  constructor(public dialog: DialogService, public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('CharityOrganizationService', this);
  }
  _getDialogComponent(): ComponentType<any> {
    throw new Error('Method not implemented.');
  }
  _getModel(): new () => CharityOrganization {
    return CharityOrganization;
  }
  _getServiceURL(): string {
    return this.urlService.URLS.CHARITY_ORGANIZATION;
  }

}
