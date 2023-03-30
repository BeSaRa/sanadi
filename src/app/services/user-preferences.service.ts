import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {CrudGenericService} from '@app/generics/crud-generic-service';
import {UserPreferences} from '@models/user-preferences';
import {UrlService} from '@services/url.service';
import {FactoryService} from '@services/factory.service';
import {CastResponse, CastResponseContainer} from '@decorators/cast-response';
import {Observable, of} from 'rxjs';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {switchMap} from 'rxjs/operators';
import {IDialogData} from '@contracts/i-dialog-data';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {DialogService} from '@services/dialog.service';
import {
  UserPreferencesPopupComponent
} from '@app/shared/popups/user-preferences-popup/user-preferences-popup.component';
import {HasInterception, InterceptParam} from '@decorators/intercept-model';
import {InternalUser} from '@models/internal-user';
import {ExternalUser} from '@models/external-user';

@CastResponseContainer({
  $default: {
    model: () => UserPreferences
  }
})
@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService extends CrudGenericService<UserPreferences> {
  list: UserPreferences[] = [];

  constructor(public http: HttpClient,
              private urlService: UrlService,
              public dialog: DialogService) {
    super();
    FactoryService.registerService('UserPreferencesService', this);
  }

  _getModel(): new () => UserPreferences {
    return UserPreferences;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.USER_PREFERENCES;
  }

  @CastResponse(() => UserPreferences, {
    unwrap: 'rs',
    fallback: '$default'
  })
  _getUserPreferences(generalUserId: number): Observable<UserPreferences> {
    return this.http.get<UserPreferences>(this._getServiceURL() + '/general-user-id/' + generalUserId);
  }

  getUserPreferences(generalUserId: number): Observable<UserPreferences> {
    return this._getUserPreferences(generalUserId);
  }

  @HasInterception
  @CastResponse(() => UserPreferences, {
    unwrap: 'rs',
    fallback: '$default'
  })
  _updateUserPreferences(generalUserId: number, @InterceptParam() model: UserPreferences): Observable<UserPreferences> {
    return this.http.post<UserPreferences>(this._getServiceURL() + '/general-user-id/' + generalUserId, model);
  }

  updateUserPreferences(generalUserId: number, model: UserPreferences): Observable<UserPreferences> {
    return this._updateUserPreferences(generalUserId, model);
  }

  openEditDialog(user: InternalUser | ExternalUser, isLoggedInUserPreferences = true): Observable<DialogRef> {
    return this.getUserPreferences(user.generalUserId).pipe(
      switchMap((model: UserPreferences) => {
        return of(this.dialog.show<IDialogData<UserPreferences>>(UserPreferencesPopupComponent, {
          model: model,
          user: user,
          operation: OperationTypes.UPDATE,
          isLoggedInUserPreferences: isLoggedInUserPreferences
        }));
      })
    )
  }
}
