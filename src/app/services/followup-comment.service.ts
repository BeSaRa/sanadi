import { Injectable } from '@angular/core';
import { FollowupComment } from '@app/models/followup-comment';
import {
  FollowupCommentPopupComponent
} from '@app/modules/followup/popups/followup-comment-popup/followup-comment-popup.component';
import { ComponentType } from '@angular/cdk/portal';
import { DialogService } from '@app/services/dialog.service';
import { HttpClient } from '@angular/common/http';
import { FactoryService } from '@app/services/factory.service';
import { UrlService } from '@app/services/url.service';
import { Observable } from 'rxjs';
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import { Pagination } from "@app/models/pagination";
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";

@CastResponseContainer({
  $default: {
    model: () => FollowupComment
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => FollowupComment }
  }
})
@Injectable({
  providedIn: 'root'
})
export class FollowupCommentService extends CrudWithDialogGenericService<FollowupComment> {
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

  _getServiceURL(): string {
    return this.urlService.URLS.FOLLOWUP_COMMENT;
  }

  @CastResponse(undefined)
  getCommentsByFollowupId(followUpId: number): Observable<FollowupComment[]> {
    return this.http.get<FollowupComment[]>(this._getServiceURL() + '/follow-up/' + followUpId);
  }
}
