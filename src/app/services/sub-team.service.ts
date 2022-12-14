import { UserSubTeamService } from './user-sub-team.service';
import { UserSubTeam } from './../models/user-sub-team';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { SubTeamPopupComponent } from './../administration/popups/sub-team-popup/sub-team-popup.component';
import { SubTeam } from './../models/sub-team';
import { Injectable } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { UrlService } from '@app/services/url.service';
import { DialogService } from '@app/services/dialog.service';
import { FactoryService } from '@app/services/factory.service';
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";
import { Pagination } from "@app/models/pagination";

@CastResponseContainer({
  $default: {
    model: () => SubTeam
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => SubTeam }
  }
})
@Injectable({
  providedIn: 'root'
})
export class SubTeamService extends CrudWithDialogGenericService<SubTeam> {
  _getModel(): new () => SubTeam {
    return SubTeam
  }

  list: SubTeam[] = [];

  constructor(public http: HttpClient,
    private urlService: UrlService,
    private userSubTeamService: UserSubTeamService,
    public dialog: DialogService) {
    super();
    FactoryService.registerService('SubTeamService', this);
  }

  _getDialogComponent(): ComponentType<any> {
    return SubTeamPopupComponent;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.SUB_TEAM;
  }

  updateStatus(SubTeamId: number, newStatus: CommonStatusEnum) {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activate(SubTeamId) : this._deactivate(SubTeamId);
  }

  updateStatusBulk(recordIds: number[], newStatus: CommonStatusEnum): Observable<any> {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activateBulk(recordIds) : this._deactivateBulk(recordIds);
  }

  private _activate(SubTeamId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + SubTeamId + '/activate', {});
  }

  private _deactivate(SubTeamId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + SubTeamId + '/de-activate', {});
  }

  private _getByParentId(parent: number): Observable<SubTeam> {
    return this.http.post<SubTeam>(this._getServiceURL() + '/filter', { parent });
  }

  @CastResponse(undefined, { unwrap: 'rs', fallback: '$default' })
  getByParentId(parent: number): Observable<any> {
    return this._getByParentId(parent);
  }
  private _activateBulk(recordIds: number[]) {
    return this.http.put(this._getServiceURL() + '/bulk/activate', recordIds)
      .pipe(
        map((response: any) => {
          return response.rs;
        })
      );
  }

  private _deactivateBulk(recordIds: number[]) {
    return this.http.put(this._getServiceURL() + '/bulk/de-activate', recordIds)
      .pipe(
        map((response: any) => {
          return response.rs;
        })
      );
  }

  openViewDialog(modelId: number): Observable<DialogRef> {
    return this.getByIdComposite(modelId).pipe(
      switchMap((SubTeam: SubTeam) => {
        return of(this.dialog.show<IDialogData<SubTeam>>(SubTeamPopupComponent, {
          model: SubTeam,
          operation: OperationTypes.VIEW
        }));
      })
    );
  }


  createSubTeamUserLink(userSubTeam: Partial<UserSubTeam>): Observable<UserSubTeam> {
    return this.userSubTeamService.createUserSubTeam(userSubTeam).pipe(map(id => new UserSubTeam().clone({
      ...userSubTeam,
      status: 1,
      id
    })));
  }

  loadUserSubTeamsByUserId(generalUserId: number) {
    return this.userSubTeamService.loadUserSubTeamByUserId(generalUserId);
  }

  deleteUserSubTeamBulk(ids: number[]): Observable<Record<number, boolean>> {
    return this.userSubTeamService.deleteBulk(ids);
  }
}
