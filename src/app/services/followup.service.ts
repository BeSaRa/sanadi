import { Injectable } from '@angular/core';
import {BackendWithDialogOperationsGenericService} from '@app/generics/backend-with-dialog-operations-generic-service';
import {Followup} from '@app/models/followup';
import {DialogService} from '@app/services/dialog.service';
import {HttpClient} from '@angular/common/http';
import {UrlService} from '@app/services/url.service';
import {FactoryService} from '@app/services/factory.service';
import {FollowupInterceptor} from '@app/model-interceptors/followup.interceptor';
import {ExternalFollowupPopupComponent} from '@app/modules/followup/popups/external-followup-popup/external-followup-popup.component';
import {ComponentType} from '@angular/cdk/portal';
import {Observable} from 'rxjs';
import {Generator} from '@app/decorators/generator';
import {FollowupCommentPopupComponent} from '@app/modules/followup/popups/followup-comment-popup/followup-comment-popup.component';

@Injectable({
  providedIn: 'root'
})
export class FollowupService extends BackendWithDialogOperationsGenericService<Followup> {
  interceptor: FollowupInterceptor = new FollowupInterceptor();

  list: Followup[] = [];

  constructor(public dialog: DialogService, public http: HttpClient, private urlService: UrlService,
  ) {
    super();
    FactoryService.registerService('FollowupService', this);

  }

  _getDialogComponent(): ComponentType<any> {
    return ExternalFollowupPopupComponent;
  }

  _getCommentsDialogComponent(): ComponentType<any> {
    return FollowupCommentPopupComponent;
  }

  _getModel(): any {
    return Followup
  }

  _getReceiveInterceptor(): any {
    return this.interceptor.receive;
  }

  _getSendInterceptor(): any {
    return this. interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.FOLLOWUP;
  }

  @Generator(undefined, true, {interceptReceive: (new FollowupInterceptor().receive), property: 'rs'})
  getFollowupsByType(followupType: 'internal' | 'external' | ''): Observable<Followup[]>{
    return this.http.get<Followup[]>(this._getServiceURL() + '/' + followupType);
  }

  terminate(followUpId: number):Observable<Followup>{
    //TO DISCUSS
    return this.http.put<Followup>(this._getServiceURL() + '/' + followUpId +'/terminate',null)
  }
}
