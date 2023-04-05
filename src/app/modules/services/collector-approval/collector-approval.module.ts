import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {CollectorApprovalRoutingModule} from './collector-approval-routing.module';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import {SharedServicesModule} from '@modules/services/shared-services/shared-services.module';
import {
  CollectorApprovalComponent
} from '@modules/services/collector-approval/pages/collector-approval/collector-approval.component';
import {
  CollectorItemComponent
} from '@modules/services/collector-approval/shared/collector-item/collector-item.component';
import {
  CollectorApprovalApproveTaskPopupComponent
} from '@modules/services/collector-approval/popups/collector-approval-approve-task-popup/collector-approval-approve-task-popup.component';
import {
  CollectorApprovalOutputsComponent
} from '@modules/services/collector-approval/pages/collector-approval-outputs/collector-approval-outputs.component';
import { CollectorApprovalPopupComponent } from './shared/collector-item/collector-approval-popup/collector-approval-popup.component';
import { AuditCollectorApprovalComponent } from './audit/audit-collector-approval/audit-collector-approval.component';
import { AuditCollectorItemComponent } from './audit/audit-collector-item/audit-collector-item.component';


@NgModule({
  declarations: [
    CollectorApprovalComponent,
    CollectorApprovalOutputsComponent,
    CollectorItemComponent,
    CollectorApprovalPopupComponent,
    CollectorApprovalApproveTaskPopupComponent,
    AuditCollectorApprovalComponent,
    AuditCollectorItemComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    SharedServicesModule,
    CollectorApprovalRoutingModule
  ]
})
export class CollectorApprovalModule { }
