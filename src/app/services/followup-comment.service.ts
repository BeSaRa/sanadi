import {Injectable} from '@angular/core';
import {BackendWithDialogOperationsGenericService} from '@app/generics/backend-with-dialog-operations-generic-service';
import {FollowupComment} from '@app/models/followup-comment';
import {FollowupCommentPopupComponent} from '@app/modules/followup/popups/followup-comment-popup/followup-comment-popup.component';
import {ComponentType} from '@angular/cdk/portal';
import {DialogService} from '@app/services/dialog.service';
import {HttpClient} from '@angular/common/http';
import {FactoryService} from '@app/services/factory.service';
import {UrlService} from '@app/services/url.service';
import {FollowupCommentInterceptor} from '@app/model-interceptors/followup-comment.interceptor';
import {Observable} from 'rxjs';
import {Generator} from '@app/decorators/generator';

@Injectable({
  providedIn: 'root'
})
export class FollowupCommentService extends BackendWithDialogOperationsGenericService<FollowupComment> {
  interceptor: FollowupCommentInterceptor = new FollowupCommentInterceptor();
  list: FollowupComment[] = [];

  constructor(public dialog: DialogService, public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('FollowupCommentService', this);

  }

  _getDialogComponent(): ComponentType<any> {
    return FollowupCommentPopupComponent;
  }

  _getModel(): any {
    return FollowupComment;
  }

  _getReceiveInterceptor(): any {
    return this.interceptor.receive;
  }

  _getSendInterceptor(): any {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.FOLLOWUP_COMMENT;
  }

  @Generator(undefined, true, {interceptReceive: (new FollowupCommentInterceptor().receive), property: 'rs'})
  getCommentsByFollowupId(followUpId: number): Observable<FollowupComment[]> {
    return this.http.get<FollowupComment[]>(this._getServiceURL() + '/follow-up/' + followUpId);
  }
}
