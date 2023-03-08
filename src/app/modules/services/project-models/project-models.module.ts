import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ProjectModelsRoutingModule} from './project-models-routing.module';
import {ProjectModelOutputsComponent} from './pages/project-model-outputs/project-model-outputs.component';
import {ProjectModelComponent} from '@modules/services/project-models/pages/project-model/project-model.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';


@NgModule({
  declarations: [
    ProjectModelComponent,
    ProjectModelOutputsComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    ProjectModelsRoutingModule
  ]
})
export class ProjectModelsModule {
}
