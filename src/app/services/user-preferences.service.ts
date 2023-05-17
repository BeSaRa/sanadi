import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CrudGenericService } from '@app/generics/crud-generic-service';
import { UserPreferences } from '@models/user-preferences';
import { UrlService } from '@services/url.service';
import { FactoryService } from '@services/factory.service';
import { CastResponse, CastResponseContainer } from '@decorators/cast-response';
import { Observable, of } from 'rxjs';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { switchMap } from 'rxjs/operators';
import { IDialogData } from '@contracts/i-dialog-data';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { DialogService } from '@services/dialog.service';
import {
  UserPreferencesPopupComponent
} from '@app/shared/popups/user-preferences-popup/user-preferences-popup.component';
import { HasInterception, InterceptParam } from '@decorators/intercept-model';
import { InternalUser } from '@models/internal-user';
import { ExternalUser } from '@models/external-user';
import { SetVacationPopupComponent } from '@app/shared/popups/set-vacation-popup/set-vacation-popup.component';
import { ISetVacationData } from '@app/interfaces/i-set-vacation-data';
import { AdminResult } from '@app/models/admin-result';
import { LangService } from './lang.service';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { CommonUtils } from '@app/helpers/common-utils';

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
    public dialog: DialogService,
    private lang: LangService) {
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
  _validatePreferences(generalUserId: number, @InterceptParam() model: UserPreferences): Observable<AdminResult[]> {
    const queryParams = UserPreferencesService.buildCriteriaQueryParams(model);
    return this.http.get<AdminResult[]>(this._getServiceURL() + '/out-office/validate/' + generalUserId, {
      params: queryParams
    });
  }

  private static buildCriteriaQueryParams(criteria: UserPreferences): HttpParams {
    let queryParams = new HttpParams();

    if (criteria.alternateEmailList) {
      queryParams = queryParams.append('alternateEmailList', criteria.alternateEmailList);
    }
    if (criteria.isMailNotificationEnabled) {
      queryParams = queryParams.append('isMailNotificationEnabled', criteria.isMailNotificationEnabled);
    }
    if (criteria.defaultLang) {
      queryParams = queryParams.append('defaultLang', criteria.defaultLang);
    }
    if (criteria.vacationFrom) {
      queryParams = queryParams.append('vacationFrom', criteria.vacationFrom);
    }
    if (criteria.vacationTo) {
      queryParams = queryParams.append('vacationTo', criteria.vacationTo);
    }

    return queryParams;
  }

  @HasInterception
  @CastResponse(() => UserPreferences, {
    unwrap: 'rs',
    fallback: '$default'
  })
  _updateUserPreferences(generalUserId: number, @InterceptParam() model: UserPreferences): Observable<UserPreferences> {
    return this.http.post<UserPreferences>(this._getServiceURL() + '/general-user-id/' + generalUserId, model);


  }

  @HasInterception
  @CastResponse(() => UserPreferences, {
    unwrap: 'rs',
    fallback: '$default'
  })
  _updateUserVacation(generalUserId: number, @InterceptParam() model: UserPreferences): Observable<UserPreferences | null> {
    return this._validatePreferences(generalUserId, model).pipe(
      switchMap((teams) => {
        if (teams.length > 0) {
          const teamsString = CommonUtils.generateHtmlList(this.lang.map.msg_last_in_teams, teams.map(x => x.getName()))
          return this.dialog.confirm(`${teamsString.outerHTML} <br> ${this.lang.map.msg_confirm_continue}`)
            .onAfterClose$
            .pipe(
              switchMap((click: UserClickOn) => {
                if (click === UserClickOn.YES) {
                  return this._setVacations(generalUserId, model)
                }
                return of(null);
              })
            )
        }
        return this._setVacations(generalUserId, model)
      })
    )

  }

  @HasInterception
  @CastResponse(() => UserPreferences, {
    unwrap: 'rs',
    fallback: '$default'
  })
  private _setVacations(generalUserId: number, model: Partial<UserPreferences>) {
    return this.http.put<UserPreferences>(this._getServiceURL() + '/out-office/general-user-id/' + generalUserId, model);
  }
  setVacations(generalUserId: number, model: Partial<UserPreferences>) {
    return this._setVacations(generalUserId,model)
  }
  updateUserPreferences(generalUserId: number, model: UserPreferences): Observable<UserPreferences> {
    return this._updateUserPreferences(generalUserId, model);
  }

  updateUserVacation(generalUserId: number, model: UserPreferences): Observable<UserPreferences | null> {
    return this._updateUserVacation(generalUserId, model);
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

  openVacationDialog(user: InternalUser | ExternalUser, userPreferences: UserPreferences, canEditPreferences: boolean): Observable<DialogRef> {
    return of(this.dialog.show<IDialogData<ISetVacationData>>(SetVacationPopupComponent, {
      model: {
        user: user,
        userPreferences: userPreferences,
        canEditPreferences: canEditPreferences
      },
      user: user,
      operation: OperationTypes.UPDATE,
    }));

  }
}
