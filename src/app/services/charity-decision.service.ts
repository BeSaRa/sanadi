import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { CharityDecision } from '@app/models/charity-decision';
import { Pagination } from '@app/models/pagination';
import { DialogService } from './dialog.service';
import { FactoryService } from './factory.service';
import { UrlService } from './url.service';

@CastResponseContainer({
  $default: {
    model: () => CharityDecision,
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => CharityDecision },
  },
})
@Injectable({
  providedIn: 'root',
})
export class CharityDecisionService extends CrudWithDialogGenericService<CharityDecision> {
  list: CharityDecision[] = [];
  constructor(public dialog: DialogService, public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('CharityDecisionService', this);
  }
  _getDialogComponent(): ComponentType<any> {
    throw new Error('Method not implemented.');
  }
  _getModel(): new () => CharityDecision {
    return CharityDecision;
  }
  _getServiceURL(): string {
    return this.urlService.URLS.CHARITY_DECISION;
  }

}
