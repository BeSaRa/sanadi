import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CastResponse, CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { GoveranceDocument } from '@app/models/goverance-document';
import { Pagination } from '@app/models/pagination';
import { map } from 'rxjs/operators';
import { DialogService } from './dialog.service';
import { FactoryService } from './factory.service';
import { UrlService } from './url.service';

@CastResponseContainer({
  $default: {
    model: () => GoveranceDocument,
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => GoveranceDocument },
  },
})
@Injectable({
  providedIn: 'root',
})
export class GoveranceDocumentService extends CrudWithDialogGenericService<GoveranceDocument> {
  list: GoveranceDocument[] = [];
  constructor(public dialog: DialogService, public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('GoveranceDocumentService', this);
  }
  _getDialogComponent(): ComponentType<any> {
    throw new Error('Method not implemented.');
  }
  _getModel(): new () => GoveranceDocument {
    return GoveranceDocument;
  }
  _getServiceURL(): string {
    return this.urlService.URLS.GOVERNANCE_DOCUMENT;
  }

  @CastResponse(undefined)
  getByCharityId(id: number) {
    return this.http.get<GoveranceDocument[]>(this._getServiceURL() + '/charity/' + id)
  }

}
