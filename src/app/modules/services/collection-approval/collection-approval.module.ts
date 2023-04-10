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


@NgModule({
  declarations: [
    CollectionApprovalComponent,
    CollectionApprovalOutputsComponent,
    CollectionItemComponent,
    CollectionApprovalApproveTaskPopupComponent
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
