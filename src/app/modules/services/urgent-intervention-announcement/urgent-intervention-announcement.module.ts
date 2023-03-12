import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UrgentInterventionAnnouncementRoutingModule } from './urgent-intervention-announcement-routing.module';
import { UrgentInterventionAnnouncementOutputsComponent } from './pages/urgent-intervention-announcement-outputs/urgent-intervention-announcement-outputs.component';
import {
  UrgentInterventionAnnouncementComponent
} from '@modules/services/urgent-intervention-announcement/pages/urgent-intervention-announcement/urgent-intervention-announcement.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import {SharedServicesModule} from '@modules/services/shared-services/shared-services.module';


@NgModule({
  declarations: [
    UrgentInterventionAnnouncementComponent,
    UrgentInterventionAnnouncementOutputsComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    SharedServicesModule,
    UrgentInterventionAnnouncementRoutingModule
  ]
})
export class UrgentInterventionAnnouncementModule { }
