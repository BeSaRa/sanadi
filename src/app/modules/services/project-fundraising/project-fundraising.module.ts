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


@NgModule({
  declarations: [
    ProjectFundraisingComponent,
    ProjectFundraisingOutputsComponent,
    DeductionRatioManagerComponent,
    TargetedCountriesDistributionComponent,
    TargetedYearsDistributionComponent,
    ProjectFundraisingApproveTaskPopupComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    SharedServicesModule,
    ProjectFundraisingRoutingModule
  ]
})
export class ProjectFundraisingModule {
}
