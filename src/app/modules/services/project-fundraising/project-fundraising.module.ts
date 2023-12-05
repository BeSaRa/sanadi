import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ProjectFundraisingRoutingModule} from './project-fundraising-routing.module';
import {
  ProjectFundraisingComponent
} from '@modules/services/project-fundraising/pages/project-fundraising/project-fundraising.component';
import {
  DeductionRatioManagerComponent
} from '@modules/services/project-fundraising/pages/project-fundraising/components/deduction-ratio-manager/deduction-ratio-manager.component';
import {
  TargetedCountriesDistributionComponent
} from '@modules/services/project-fundraising/pages/project-fundraising/components/targeted-countries-distribution/targeted-countries-distribution.component';
import {
  TargetedYearsDistributionComponent
} from '@modules/services/project-fundraising/pages/project-fundraising/components/targeted-years-distribution/targeted-years-distribution.component';
import {
  ProjectFundraisingOutputsComponent
} from './pages/project-fundraising-outputs/project-fundraising-outputs.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import {
  ProjectFundraisingApproveTaskPopupComponent
} from '@modules/services/project-fundraising/popups/project-fundraising-approve-task-popup/project-fundraising-approve-task-popup.component';
import {SharedServicesModule} from '@modules/services/shared-services/shared-services.module';
import { AuditProjectFundraisingComponent } from './audit/audit-project-fundraising/audit-project-fundraising.component';
import { AuditDeductionRatioManagerComponent } from './audit/audit-deduction-ratio-manager/audit-deduction-ratio-manager.component';
import { AuditTargetedCountriesDistributionComponent } from './audit/audit-targeted-countries-distribution/audit-targeted-countries-distribution.component';
import { AuditTargetedYearsDistributionComponent } from './audit/audit-targeted-years-distribution/audit-targeted-years-distribution.component';
import { AuditTemplateListComponent } from './audit/audit-template-list/audit-template-list.component';
import { ProjectModelsModule } from '../project-models/project-models.module';
import { ProjectModelPreviewComponent } from '../project-models/popups/project-model-preview/project-model-preview.component';


@NgModule({
  declarations: [
    ProjectFundraisingComponent,
    ProjectFundraisingOutputsComponent,
    DeductionRatioManagerComponent,
    TargetedCountriesDistributionComponent,
    TargetedYearsDistributionComponent,
    ProjectFundraisingApproveTaskPopupComponent,
    AuditProjectFundraisingComponent,
    AuditDeductionRatioManagerComponent,
    AuditTargetedCountriesDistributionComponent,
    AuditTargetedYearsDistributionComponent,
    AuditTemplateListComponent,
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    SharedServicesModule,
    ProjectFundraisingRoutingModule,
  ]
})
export class ProjectFundraisingModule {
}
