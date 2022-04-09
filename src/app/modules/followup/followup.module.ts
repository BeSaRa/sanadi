import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExternalFollowupComponent } from './pages/external-followup/external-followup.component';
import {FollowupRoutingModule} from '@app/modules/followup/followup-routing.module';
import {SharedModule} from '@app/shared/shared.module';
import { ExternalFollowupPopupComponent } from './popups/external-followup-popup/external-followup-popup.component';
import { FollowupCommentPopupComponent } from './popups/followup-comment-popup/followup-comment-popup.component';



@NgModule({
  declarations: [
    ExternalFollowupComponent,
    ExternalFollowupPopupComponent,
    FollowupCommentPopupComponent
  ],
  imports: [
    CommonModule,
    FollowupRoutingModule,
    SharedModule,

  ]
})
export class FollowupModule { }
