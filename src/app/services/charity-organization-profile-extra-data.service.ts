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
import {switchMap} from 'rxjs/operators';
import {IDialogData} from '@contracts/i-dialog-data';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {FactoryService} from '@services/factory.service';
import {CastResponse} from '@decorators/cast-response';
import {OfficerInterceptor} from '@app/model-interceptors/officer-interceptor';

@Injectable({
  providedIn: 'root'
})
export class CharityOrganizationProfileExtraDataService extends CrudWithDialogGenericService<CharityOrganizationProfileExtraData> {
  list: CharityOrganizationProfileExtraData[] = [];
  officerInterceptor = new OfficerInterceptor();

  constructor(public http: HttpClient, public dialog: DialogService, private urlService: UrlService) {
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
}
