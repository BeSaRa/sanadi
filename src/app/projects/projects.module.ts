import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ProjectsRoutingModule} from './projects-routing.module';
import {ProjectsComponent} from './projects.component';
import {SharedModule} from "@app/shared/shared.module";
import {ProjectModelComponent} from './pages/project-model/project-model.component';
import {InternalProjectLicenseComponent} from './pages/internal-project-license/internal-project-license.component';
import {
  UrgentInterventionLicenseComponent
} from './pages/urgent-intervention-license/urgent-intervention-license.component';
import {
  UrgentInterventionApproveTaskPopupComponent
} from "@app/projects/popups/urgent-intervention-approve-task-popup/urgent-intervention-approve-task-popup.component";


@NgModule({
  declarations: [
    ProjectsComponent,
    ProjectModelComponent,
    InternalProjectLicenseComponent,
    UrgentInterventionLicenseComponent,
    UrgentInterventionApproveTaskPopupComponent
  ],
  imports: [
    CommonModule,
    ProjectsRoutingModule,
    SharedModule
  ]
})
export class ProjectsModule {
}
