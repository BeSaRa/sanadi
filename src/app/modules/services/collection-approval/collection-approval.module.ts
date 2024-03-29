import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {CollectionApprovalRoutingModule} from './collection-approval-routing.module';
import {
  CollectionApprovalOutputsComponent
} from './pages/collection-approval-outputs/collection-approval-outputs.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import {
  CollectionApprovalComponent
} from '@modules/services/collection-approval/pages/collection-services-approval/collection-approval.component';
import {
  CollectionItemComponent
} from '@modules/services/collection-approval/shared/collection-item/collection-item.component';
import {
  CollectionApprovalApproveTaskPopupComponent
} from '@modules/services/collection-approval/popups/collection-approval-approve-task-poup/collection-approval-approve-task-popup.component';
import {SharedServicesModule} from '@modules/services/shared-services/shared-services.module';
import {MapsModule} from '@modules/maps/maps.module';
import { CollectionItemPopupComponent } from './popups/collection-item-popup/collection-item-popup.component';
import { AuditCollectionItemComponent } from './audit/audit-collection-item/audit-collection-item.component';
import { AuditCollectionServicesApprovalComponent } from './audit/audit-collection-services-approval/audit-collection-services-approval.component';


@NgModule({
  declarations: [
    CollectionApprovalComponent,
    CollectionApprovalOutputsComponent,
    CollectionItemComponent,
    CollectionItemPopupComponent,
    CollectionApprovalApproveTaskPopupComponent,
    AuditCollectionItemComponent,
    AuditCollectionServicesApprovalComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    SharedServicesModule,
    CollectionApprovalRoutingModule,
    MapsModule
  ]
})
export class CollectionApprovalModule {
}
