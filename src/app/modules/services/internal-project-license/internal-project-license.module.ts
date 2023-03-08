import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InternalProjectLicenseRoutingModule } from './internal-project-license-routing.module';
import { InternalProjectLicenseOutputsComponent } from './pages/internal-project-license-outputs/internal-project-license-outputs.component';
import {
  InternalProjectLicenseComponent
} from '@modules/services/internal-project-license/pages/internal-project-license/internal-project-license.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';


@NgModule({
  declarations: [
    InternalProjectLicenseComponent,
    InternalProjectLicenseOutputsComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    InternalProjectLicenseRoutingModule
  ]
})
export class InternalProjectLicenseModule { }
