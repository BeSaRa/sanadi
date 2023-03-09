import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CollectorApprovalRoutingModule } from './collector-approval-routing.module';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import {SharedServicesModule} from '@modules/services/shared-services/shared-services.module';
import {
  CollectionApprovalOutputsComponent
} from '@modules/services/collection-approval/pages/collection-approval-outputs/collection-approval-outputs.component';
import {
  CollectorApprovalComponent
} from '@modules/services/collector-approval/pages/collector-approval/collector-approval.component';
import {
  CollectorItemComponent
} from '@modules/services/collector-approval/shared/collector-item/collector-item.component';
import {
  CollectorApprovalApproveTaskPopupComponent
} from '@modules/services/collector-approval/popups/collector-approval-approve-task-popup/collector-approval-approve-task-popup.component';


@NgModule({
  declarations: [
    CollectorApprovalComponent,
    CollectionApprovalOutputsComponent,
    CollectorItemComponent,
    CollectorApprovalApproveTaskPopupComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    SharedServicesModule,
    CollectorApprovalRoutingModule
  ]
})
export class CollectorApprovalModule { }
