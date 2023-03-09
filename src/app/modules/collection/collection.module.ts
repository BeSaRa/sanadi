import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {CollectionRoutingModule} from './collection-routing.module';
import {CollectionComponent} from './collection.component';
import {MapsModule} from '@app/modules/maps/maps.module';
import {FundraisingComponent} from './pages/fundraising/fundraising.component';
import {
  FundraisingApproveTaskPopupComponent
} from './popups/fundraising-approve-task-popup/fundraising-approve-task-popup.component';
import {CollectorApprovalComponent} from './pages/collector-approval/collector-approval.component';
import {CollectorItemComponent} from './shared/collector-item/collector-item.component';
import {
  CollectorApprovalApproveTaskPopupComponent
} from './popups/collector-approval-approve-task-popup/collector-approval-approve-task-popup.component';
import {EServicesMainModule} from '@app/modules/e-services-main/e-services-main.module';
import {SharedServicesModule} from '@modules/services/shared-services/shared-services.module';

@NgModule({
  declarations: [
    CollectionComponent,
    FundraisingComponent,
    FundraisingApproveTaskPopupComponent,
    CollectorApprovalComponent,
    CollectorItemComponent,
    CollectorApprovalApproveTaskPopupComponent
  ],
  imports: [
    CommonModule,
    CollectionRoutingModule,
    EServicesMainModule,
    SharedServicesModule,
    MapsModule
  ]
})
export class CollectionModule {
}
