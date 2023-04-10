import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {EServicesMainModule} from '@app/modules/e-services-main/e-services-main.module';
import {MapsModule} from '../maps/maps.module';
import {OfficeServicesRoutingModule} from './office-services-routing.module';
import {OfficeServicesComponent} from './office-services.component';
import {SharedServicesModule} from '@modules/services/shared-services/shared-services.module';


@NgModule({
  declarations: [
    OfficeServicesComponent

  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    SharedServicesModule,
    OfficeServicesRoutingModule,
    MapsModule
  ]
})
export class OfficeServicesModule { }
