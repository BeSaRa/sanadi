import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ProjectsRoutingModule} from './projects-routing.module';
import {ProjectsComponent} from './projects.component';
import {SharedModule} from "@app/shared/shared.module";
import {ProjectModelComponent} from './pages/project-model/project-model.component';


@NgModule({
  declarations: [
    ProjectsComponent,
    ProjectModelComponent
  ],
  imports: [
    CommonModule,
    ProjectsRoutingModule,
    SharedModule
  ]
})
export class ProjectsModule {
}
