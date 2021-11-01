import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ProjectsRoutingModule} from './projects-routing.module';
import {ProjectsComponent} from './projects.component';
import {SharedModule} from "@app/shared/shared.module";
import {ProjectModelComponent} from './pages/project-model/project-model.component';
import { InternalProjectLicenseComponent } from './pages/internal-project-license/internal-project-license.component';


@NgModule({
  declarations: [
    ProjectsComponent,
    ProjectModelComponent,
    InternalProjectLicenseComponent
  ],
  imports: [
    CommonModule,
    ProjectsRoutingModule,
    SharedModule
  ]
})
export class ProjectsModule {
}
