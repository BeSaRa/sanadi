import { ComponentType } from '@angular/cdk/portal';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProfilePopupComponent } from '@app/administration/popups/profile-popup/profile-popup.component';
import { CastResponse, CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { Pagination } from '@app/models/pagination';
import { Profile } from '@app/models/profile';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DialogService } from './dialog.service';
import { FactoryService } from './factory.service';
import { UrlService } from './url.service';

@CastResponseContainer({
  $default: {
    model: () => Profile,
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => Profile },
  },
})
@Injectable({
  providedIn: 'root'
})
export class ProfileService extends CrudWithDialogGenericService<Profile>{
  list: Profile[] = [];
  constructor(public dialog: DialogService, public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('ProfileService', this);
  }
  _getDialogComponent(): ComponentType<any> {
    return ProfilePopupComponent;
  }
  _getModel(): new () => Profile {
    return Profile;
  }
  _getServiceURL(): string {
    return this.urlService.URLS.PROFILE;
  }
  activate(id: number) {
    return this.http.put(this._getServiceURL() + `/${id}/activate`, {});
  }
  deActivate(id: number) {
    return this.http.put(this._getServiceURL() + `/${id}/de-activate`, {});
  }
  openViewDialog(modelId: number): Observable<DialogRef> {
    return this.getByIdComposite(modelId).pipe(
      switchMap((model: Profile) => {
        return of(this.dialog.show<IDialogData<Profile>>(this._getDialogComponent(), {
          model,
          operation: OperationTypes.VIEW
        }));
      })
    );
  }
  @CastResponse(undefined)
  getByProfileType(profileType: number) {
    const query = new HttpParams().append('profile-type', profileType);
    return this.http.get<Profile[]>(this._getServiceURL() + '/criteria', { params: query });
  }
  @CastResponse(undefined)
  getByRegistrationAuthorities() {
    return this.http.get<Profile[]>(this._getServiceURL() + '/registration-authorities');
  }
}
