import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {CollectionRoutingModule} from './collection-routing.module';
import {CollectionComponent} from './collection.component';
import {SharedModule} from "@app/shared/shared.module";
import {CollectionApprovalComponent} from './pages/collection-services-approval/collection-approval.component';
import {CollectionItemComponent} from './shared/collection-item/collection-item.component';
import {
  CollectionApprovalApproveTaskPopupComponent
} from './popups/collection-approval-approve-task-poup/collection-approval-approve-task-popup.component';
import {ApprovalFormComponent} from './shared/approval-form/approval-form.component';
import {MapsModule} from "@app/modules/maps/maps.module";
import { FundraisingComponent } from './pages/fundraising/fundraising.component';
import { FundraisingApproveTaskPopupComponent } from './popups/fundraising-approve-task-popup/fundraising-approve-task-popup.component';
import { CollectorApprovalComponent } from './pages/collector-approval/collector-approval.component';
import { CollectorItemComponent } from './shared/collector-item/collector-item.component';
import { CollectorApprovalApproveTaskPopupComponent } from './popups/collector-approval-approve-task-popup/collector-approval-approve-task-popup.component';

@NgModule({
  declarations: [
    CollectionComponent,
    CollectionApprovalComponent,
    CollectionItemComponent,
    CollectionApprovalApproveTaskPopupComponent,
    ApprovalFormComponent,
    FundraisingComponent,
    FundraisingApproveTaskPopupComponent,
    CollectorApprovalComponent,
    CollectorItemComponent,
    CollectorApprovalApproveTaskPopupComponent
  ],
  imports: [
    CommonModule,
    CollectionRoutingModule,
    SharedModule,
    MapsModule
  ],
  exports:[
    ApprovalFormComponent
  ]
})
export class CollectionModule {
}
