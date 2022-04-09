import { Injectable } from '@angular/core';
import {BackendWithDialogOperationsGenericService} from '@app/generics/backend-with-dialog-operations-generic-service';
import {FollowupComment} from '@app/models/followup-comment';
import {FollowupCommentPopupComponent} from '@app/modules/followup/popups/followup-comment-popup/followup-comment-popup.component';
import {ComponentType} from '@angular/cdk/portal';
import {DialogService} from '@app/services/dialog.service';
import {HttpClient} from '@angular/common/http';
import {FactoryService} from '@app/services/factory.service';

@Injectable({
  providedIn: 'root'
})
export class FollowupCommentService extends BackendWithDialogOperationsGenericService<FollowupComment>{
  list: FollowupComment[] = [];

constructor( public dialog: DialogService, public http: HttpClient) {
  super();
  FactoryService.registerService('FollowupCommentService', this);

}
  _getDialogComponent(): ComponentType<any> {
    return FollowupCommentPopupComponent;
  }

  _getModel(): any {
  }

  _getReceiveInterceptor(): any {
  }

  _getSendInterceptor(): any {
  }

  _getServiceURL(): string {
    return '';
  }


}
