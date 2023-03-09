import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RemittancesRoutingModule} from './remittances-routing.module';
import {RemittanceComponent} from './remittance.component';
import {EServicesMainModule} from '@app/modules/e-services-main/e-services-main.module';

@NgModule({
  declarations: [
    RemittanceComponent,
  ],
  imports: [CommonModule, RemittancesRoutingModule, EServicesMainModule],
})
export class RemittancesModule {}
