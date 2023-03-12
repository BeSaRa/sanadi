import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FundraisingChannelLicensingRoutingModule } from './fundraising-channel-licensing-routing.module';
import { FundraisingChannelLicensingOutputsComponent } from './pages/fundraising-channel-licensing-outputs/fundraising-channel-licensing-outputs.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import {SharedServicesModule} from '@modules/services/shared-services/shared-services.module';
import {
  FundraisingComponent
} from '@modules/services/fundraising-channel-licensing/pages/fundraising/fundraising.component';
import {
  FundraisingApproveTaskPopupComponent
} from '@modules/services/fundraising-channel-licensing/popups/fundraising-approve-task-popup/fundraising-approve-task-popup.component';


@NgModule({
  declarations: [
    FundraisingComponent,
    FundraisingChannelLicensingOutputsComponent,
    FundraisingApproveTaskPopupComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    SharedServicesModule,
    FundraisingChannelLicensingRoutingModule
  ]
})
export class FundraisingChannelLicensingModule { }
