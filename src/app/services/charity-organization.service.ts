import { ProfileService } from '@services/profile.service';
import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CastResponse, CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { BlobModel } from '@app/models/blob-model';
import { CharityOrganization } from '@app/models/charity-organization';
import { FileStore } from '@app/models/file-store';
import { Pagination } from '@app/models/pagination';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { DialogService } from './dialog.service';
import { FactoryService } from './factory.service';
import { UrlService } from './url.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { CharityProfilePopupComponent } from '@app/administration/popups/charity-profile-popup/charity-profile-popup.component';
import { Profile } from '@app/models/profile';
import { PaginationContract } from '@app/contracts/pagination-contract';

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
    , public dialog: DialogService, public http: HttpClient,
     private urlService: UrlService,
    private profileService:ProfileService) {
    super();
    FactoryService.registerService('CharityOrganizationService', this);
  }
  _getDialogComponent(): ComponentType<any> {
    return CharityProfilePopupComponent
  }
  _getModel(): new () => CharityOrganization {
    return CharityOrganization;
  }
  _getServiceURL(): string {
    return this.urlService.URLS.CHARITY_ORGANIZATION;
  }
  _getProfileURL():string{
    return this.urlService.URLS.PROFILE
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
  openViewDialog(profileId: number): Observable<DialogRef> {
    return this.loadProfile(profileId).pipe(
      switchMap((model: CharityOrganization) => {
        return of(this.dialog.show<IDialogData<CharityOrganization>>(this._getDialogComponent(), {
          model,
          operation: OperationTypes.VIEW
        }));
      })
    );
  }
  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  loadProfile(id:number): Observable<CharityOrganization> {
    return this.http.get<CharityOrganization>(this._getServiceURL() + `/profile/${id}`);
  }
  @CastResponse(undefined, {
    fallback: '$pagination'
  })
  paginateComposite(options: Partial<PaginationContract>): Observable<Pagination<CharityOrganization[]>> {
    return this.profileService.getCharitiesProfiles().pipe(
      tap(result => this.list = result.rs),
      tap(result => this._loadDone$.next(result.rs))
    );
  }
}
