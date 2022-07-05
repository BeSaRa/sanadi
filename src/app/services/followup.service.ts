import { Injectable } from '@angular/core';
import { Followup } from '@app/models/followup';
import { DialogService } from '@app/services/dialog.service';
import { HttpClient } from '@angular/common/http';
import { UrlService } from '@app/services/url.service';
import { FactoryService } from '@app/services/factory.service';
import {
  ExternalFollowupPopupComponent
} from '@app/modules/followup/popups/external-followup-popup/external-followup-popup.component';
import { ComponentType } from '@angular/cdk/portal';
import { Observable, of } from 'rxjs';
import {
  FollowupCommentPopupComponent
} from '@app/modules/followup/popups/followup-comment-popup/followup-comment-popup.component';
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";
import { ReasonPopupComponent } from "@app/shared/popups/reason-popup/reason-popup.component";
import { ReasonContract } from "@contracts/reason-contract";
import { LangService } from "@services/lang.service";
import { map, switchMap } from "rxjs/operators";
import { UserClickOn } from "@app/enums/user-click-on.enum";

@CastResponseContainer({
  $default: {
    model: () => Followup
  }
})
@Injectable({
  providedIn: 'root'
})
export class FollowupService extends CrudWithDialogGenericService<Followup> {

  list: Followup[] = [];

  constructor(public dialog: DialogService,
              public http: HttpClient,
              private lang: LangService,
              private urlService: UrlService,
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

  _getServiceURL(): string {
    return this.urlService.URLS.FOLLOWUP;
  }

  @CastResponse(() => Followup, {
    fallback: '$default',
    unwrap: 'rs'
  })
  getFollowupsByType(followupType: 'internal' | 'external' | ''): Observable<Followup[]> {
    return this.http.get<Followup[]>(this._getServiceURL() + '/' + followupType);
  }

  @CastResponse(() => Followup, {
    fallback: '$default',
    unwrap: 'rs'
  })
  getByCaseId(caseId: string): Observable<Followup[]> {
    return this.http.get<Followup[]>(this._getServiceURL() + '/case/' + caseId);
  }

  terminate(followUpId: number): Observable<Followup> {
    return this.http.put<Followup>(this._getServiceURL() + '/' + followUpId + '/terminate', null)
  }

  private reject(followupId: number, comment: string): Observable<any> {
    return this.http.put(this._getServiceURL() + '/' + followupId + '/reject', comment)
  }

  rejectTerminate(followup: Followup, options?: Partial<ReasonContract>): Observable<any> {
    return this.dialog.show<ReasonContract>(ReasonPopupComponent, {
      saveBtn: this.lang.map.lbl_reject,
      required: true,
      reasonLabel: this.lang.map.comment,
      title: this.lang.map.reject_terminate,
      ...options
    })
      .onAfterClose$
      .pipe(switchMap((result: { click: UserClickOn, comment: string }) => {
        return result.click === UserClickOn.YES ? this.reject(followup.id, result.comment).pipe(map(_ => result.comment)) : of('')
      }))
  }
}
