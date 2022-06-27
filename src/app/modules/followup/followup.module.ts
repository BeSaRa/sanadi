import { NgModule } from '@angular/core';
import { ExternalFollowupComponent } from './pages/external-followup/external-followup.component';
import { FollowupRoutingModule } from '@app/modules/followup/followup-routing.module';
import { SharedModule } from '@app/shared/shared.module';
import { ExternalFollowupPopupComponent } from './popups/external-followup-popup/external-followup-popup.component';
import { FollowupCommentPopupComponent } from './popups/followup-comment-popup/followup-comment-popup.component';
import { InternalFollowupComponent } from './pages/internal-followup/internal-followup.component';


@NgModule({
  declarations: [
    ExternalFollowupComponent,
    ExternalFollowupPopupComponent,
    FollowupCommentPopupComponent,
    InternalFollowupComponent
  ],
  imports: [
    SharedModule,
    FollowupRoutingModule,
  ]
})
export class FollowupModule {}
