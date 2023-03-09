import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {CollectionRoutingModule} from './collection-routing.module';
import {CollectionComponent} from './collection.component';
import {MapsModule} from '@app/modules/maps/maps.module';
import {EServicesMainModule} from '@app/modules/e-services-main/e-services-main.module';
import {SharedServicesModule} from '@modules/services/shared-services/shared-services.module';

@NgModule({
  declarations: [
    CollectionComponent
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
