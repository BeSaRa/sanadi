import { AuditForeignCountriesProjectsComponent } from './audit/audit-foreign-countries-projects/audit-foreign-countries-projects.component';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ForeignCountriesProjectsRoutingModule} from './foreign-countries-projects-routing.module';
import {
  ForeignCountriesProjectOutputsComponent
} from './pages/foreign-countries-project-outputs/foreign-countries-project-outputs.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import {
  ForeignCountriesProjectsComponent
} from '@modules/services/foreign-countries-projects/pages/foreign-countries-projects/foreign-countries-projects.component';
import {
  ForeignCountriesProjectsApprovalPopupComponent
} from '@modules/services/foreign-countries-projects/popups/foreign-countries-projects-approval-popup/foreign-countries-projects-approval-popup.component';
import {
  ProjectNeedsComponent
} from '@modules/services/foreign-countries-projects/shared/project-needs/project-needs.component';
import { AuditProjectNeedComponent } from './audit/audit-project-need/audit-project-need.component';


@NgModule({
  declarations: [
    ForeignCountriesProjectsComponent,
    ForeignCountriesProjectOutputsComponent,
    ForeignCountriesProjectsApprovalPopupComponent,
    ProjectNeedsComponent,
    AuditForeignCountriesProjectsComponent,
    AuditProjectNeedComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    ForeignCountriesProjectsRoutingModule
  ]
})
export class ForeignCountriesProjectsModule { }
