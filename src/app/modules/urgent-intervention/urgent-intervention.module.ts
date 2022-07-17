import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UrgentInterventionRoutingModule } from './urgent-intervention-routing.module';
import { UrgentInterventionComponent } from './urgent-intervention.component';
import {
  UrgentInterventionLicenseComponent
} from '@app/modules/urgent-intervention/pages/urgent-intervention-license/urgent-intervention-license.component';
import {
  UrgentInterventionApproveTaskPopupComponent
} from '@app/modules/urgent-intervention/popups/urgent-intervention-approve-task-popup/urgent-intervention-approve-task-popup.component';
import {
  UrgentInterventionReportComponent
} from '@app/modules/urgent-intervention/pages/urgent-intervention-report/urgent-intervention-report.component';
import {EServicesMainModule} from '@app/modules/e-services-main/e-services-main.module';
import {
  ImplementingAgencyListComponent
} from '@app/modules/urgent-intervention/shared/implementing-agency-list/implementing-agency-list.component';
import {
  InterventionRegionListComponent
} from '@app/modules/urgent-intervention/shared/intervention-region-list/intervention-region-list.component';
import {
  InterventionFieldListComponent
} from '@app/modules/urgent-intervention/shared/intervention-field-list/intervention-field-list.component';
import { UrgentInterventionClosureComponent } from './pages/urgent-intervention-closure/urgent-intervention-closure.component';
import { StageListComponent } from './shared/stage-list/stage-list.component';
import { ResultListComponent } from './shared/result-list/result-list.component';
import { ImplementationEvaluationListComponent } from './shared/implementation-evaluation-list/implementation-evaluation-list.component';
import { BestPracticesListComponent } from './shared/best-practices-list/best-practices-list.component';
import { LessonsLearntListComponent } from './shared/lessons-learnt-list/lessons-learnt-list.component';


@NgModule({
  declarations: [
    UrgentInterventionComponent,
    UrgentInterventionLicenseComponent,
    UrgentInterventionApproveTaskPopupComponent,
    UrgentInterventionReportComponent,
    ImplementingAgencyListComponent,
    InterventionRegionListComponent,
    InterventionFieldListComponent,
    UrgentInterventionClosureComponent,
    StageListComponent,
    ResultListComponent,
    ImplementationEvaluationListComponent,
    BestPracticesListComponent,
    LessonsLearntListComponent
  ],
  imports: [
    CommonModule,
    UrgentInterventionRoutingModule,
    EServicesMainModule,
  ]
})
export class UrgentInterventionModule { }
