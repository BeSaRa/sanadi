import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { BlobModel } from '@app/models/blob-model';
import { CharityOrganization } from '@app/models/charity-organization';
import { FileStore } from '@app/models/file-store';
import { Pagination } from '@app/models/pagination';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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
  $logo: {
    model: () => FileStore
  }
})
@Injectable({
  providedIn: 'root',
})
export class CharityOrganizationService extends CrudWithDialogGenericService<CharityOrganization> {
  list: CharityOrganization[] = [];
  constructor(private domSanitizer: DomSanitizer
    , public dialog: DialogService, public http: HttpClient, private urlService: UrlService) {
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
  saveLogo(charityId: number, file: File) {
    const form = new FormData();
    form.append('content', file);
    form.append('charityId', charityId.toString());
    return this.http.post(this._getServiceURL() + '/logo', form).pipe(map((e: any) => e.rs.id));
  }
  getLogoBy(object: { id?: string, charityId?: number }) {
    return this.http.post(this._getServiceURL() + '/logo/content', object, {
      responseType: 'blob',
      observe: 'body'
    }).pipe(
      map(blob => new BlobModel(blob, this.domSanitizer),
        catchError(_ => {
          return of(new BlobModel(new Blob([], { type: 'error' }), this.domSanitizer));
        })));
  }

}
