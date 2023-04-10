import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {UrgentInterventionRoutingModule} from './urgent-intervention-routing.module';
import {UrgentInterventionComponent} from './urgent-intervention.component';
import {EServicesMainModule} from '@app/modules/e-services-main/e-services-main.module';
import {SharedServicesModule} from '@modules/services/shared-services/shared-services.module';


@NgModule({
  declarations: [
    UrgentInterventionComponent
  ],
  exports: [],
  imports: [
    CommonModule,
    UrgentInterventionRoutingModule,
    EServicesMainModule,
    SharedServicesModule
  ]
})
export class UrgentInterventionModule {
}
