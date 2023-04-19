import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AwarenessActivitySuggestionRoutingModule} from './awareness-activity-suggestion-routing.module';
import {
  AwarenessActivitySuggestionOutputsComponent
} from './pages/awareness-activity-suggestion-outputs/awareness-activity-suggestion-outputs.component';
import {
  AwarenessActivitySuggestionComponent
} from '@modules/services/awareness-activity-suggestion/pages/awareness-activity-suggestion/awareness-activity-suggestion.component';
import {
  AwarenessActivitySuggestionApprovalPopupComponent
} from '@modules/services/awareness-activity-suggestion/popups/awareness-activity-suggestion-approval-popup/awareness-activity-suggestion-approval-popup.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';


@NgModule({
  declarations: [
    AwarenessActivitySuggestionComponent,
    AwarenessActivitySuggestionOutputsComponent,
    AwarenessActivitySuggestionApprovalPopupComponent,
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    AwarenessActivitySuggestionRoutingModule
  ]
})
export class AwarenessActivitySuggestionModule { }
