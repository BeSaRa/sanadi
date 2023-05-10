import {ComponentType} from '@angular/cdk/portal';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {CrudWithDialogGenericService} from '@app/generics/crud-with-dialog-generic-service';
import {CharityOrganizationProfileExtraData} from '@app/models/charity-organization-profile-extra-data';
import {DialogService} from './dialog.service';
import {UrlService} from '@services/url.service';
import {
  CharityOrganizationProfileExtraDataPopupComponent
} from '@app/administration/popups/charity-organization-profile-extra-data-popup/charity-organization-profile-extra-data-popup.component';
import {Observable, of} from 'rxjs';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {catchError, map, switchMap} from 'rxjs/operators';
import {IDialogData} from '@contracts/i-dialog-data';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {FactoryService} from '@services/factory.service';
import {CastResponse, CastResponseContainer} from '@decorators/cast-response';
import {OfficerInterceptor} from '@app/model-interceptors/officer-interceptor';
import {BranchInterceptor} from '@app/model-interceptors/branch-interceptor';
import {Officer} from '@app/models/officer';
import {Branch} from '@app/models/branch';
import {BlobModel} from '@app/models/blob-model';
import {DomSanitizer} from '@angular/platform-browser';
import {BranchOfficersPopupComponent} from '@app/administration/shared/branch-officers-popup/branch-officers-popup.component';
import {Profile} from '@app/models/profile';
import {AdminResult} from '@app/models/admin-result';

@CastResponseContainer({
  $default: {
    model: () => CharityOrganizationProfileExtraData,
    shape: {
      'contactOfficerList.*': () => Officer,
      'complianceOfficerList.*': () => Officer,
      'branchList.*': () => Branch,
      'branchList.*.branchContactOfficerList.*': () => Officer,
      'profileInfo': () => Profile,
      'profileInfo.registrationAuthorityInfo': () => AdminResult
    }
  }
})
@Injectable({
  providedIn: 'root'
})
export class CharityOrganizationProfileExtraDataService extends CrudWithDialogGenericService<CharityOrganizationProfileExtraData> {
  list: CharityOrganizationProfileExtraData[] = [];
  officerInterceptor = new OfficerInterceptor();
  branchInterceptor = new BranchInterceptor();

  constructor(public http: HttpClient, public dialog: DialogService, private urlService: UrlService, private domSanitizer: DomSanitizer) {
    super();
    FactoryService.registerService('CharityOrganizationProfileExtraDataService', this);
  }

  _getDialogComponent(): ComponentType<any> {
    return CharityOrganizationProfileExtraDataPopupComponent;
  }

  _getModel(): new () => CharityOrganizationProfileExtraData {
    return CharityOrganizationProfileExtraData;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.CHARITY_ORGANIZATION_PROFILE_EXTRA_DATA;
  }

  @CastResponse(()=> CharityOrganizationProfileExtraData, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _getCharityOrgExtraDataByProfileId(profileId: number): Observable<CharityOrganizationProfileExtraData> {
    return this.http.get<CharityOrganizationProfileExtraData>(this._getServiceURL() + '/profile/' + profileId);
  }

  getCharityOrgExtraDataByProfileId(profileId: number): Observable<CharityOrganizationProfileExtraData> {
    return this._getCharityOrgExtraDataByProfileId(profileId)
  }

  openCharityOrgExtraDataDialog(profileId: number): Observable<DialogRef> {
    return this.getCharityOrgExtraDataByProfileId(profileId).pipe(
      switchMap((model: CharityOrganizationProfileExtraData) => {
        return of(this.dialog.show<IDialogData<CharityOrganizationProfileExtraData>>(this._getDialogComponent(), {
          model: model,
          operation: OperationTypes.UPDATE
        }));
      })
    )
  }

  openBranchContactOfficersDialog(model: Branch): Observable<DialogRef> {
    return of(this.dialog.show<IDialogData<Branch>>(BranchOfficersPopupComponent, {
      model: model,
      operation: OperationTypes.UPDATE
    }));
  }

  updateLogo(profileId: number, file: File): Observable<boolean> {
    let form = new FormData();
    form.append('content', file);
    return this.http.post<boolean>(this._getServiceURL() + '/logo?charityId=' + profileId, form);
  }

  getLogo(profileId: number): Observable<BlobModel> {
    return this.http.post(this._getServiceURL() + '/logo/content', { charityId: profileId }, {
      responseType: 'blob',
      observe: 'body'
    }).pipe(
      map(blob => new BlobModel(blob, this.domSanitizer),
        catchError(_ => {
          return of(new BlobModel(new Blob([], { type: 'error' }), this.domSanitizer));
        })));
  }
}
