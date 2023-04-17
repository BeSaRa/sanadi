import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UrgentInterventionClosureRoutingModule } from './urgent-intervention-closure-routing.module';
import { UrgentInterventionClosureOutputsComponent } from './pages/urgent-intervention-closure-outputs/urgent-intervention-closure-outputs.component';
import {
  UrgentInterventionClosureComponent
} from '@modules/services/urgent-intervention-closure/pages/urgent-intervention-closure/urgent-intervention-closure.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import {SharedServicesModule} from '@modules/services/shared-services/shared-services.module';
import {
  StageListComponent
} from '@modules/services/urgent-intervention-closure/pages/urgent-intervention-closure/components/stage-list/stage-list.component';
import {
  ResultListComponent
} from '@modules/services/urgent-intervention-closure/pages/urgent-intervention-closure/components/result-list/result-list.component';
import {
  ImplementationEvaluationListComponent
} from '@modules/services/urgent-intervention-closure/pages/urgent-intervention-closure/components/implementation-evaluation-list/implementation-evaluation-list.component';
import {
  BestPracticesListComponent
} from '@modules/services/urgent-intervention-closure/pages/urgent-intervention-closure/components/best-practices-list/best-practices-list.component';
import {
  LessonsLearntListComponent
} from '@modules/services/urgent-intervention-closure/pages/urgent-intervention-closure/components/lessons-learnt-list/lessons-learnt-list.component';
import {
  UrgentInterventionClosureApproveTaskPopupComponent
} from '@modules/services/urgent-intervention-closure/popups/urgent-intervention-closure-approve-task-popup/urgent-intervention-closure-approve-task-popup.component';
import { StageListPopupComponent } from './popups/stage-list-popup/stage-list-popup.component';
import { ResultListPopupComponent } from './popups/result-list-popup/result-list-popup.component';
import { ImplementationEvaluationPopupComponent } from './popups/implementation-evaluation-popup/implementation-evaluation-popup.component';
import { BestPracticesPopupComponent } from './popups/best-practices-popup/best-practices-popup.component';
import { LessonsLearntPopupComponent } from './popups/lessons-learnt-popup/lessons-learnt-popup.component';
import { AuditUrgentInterventionClosureComponent } from './audit/audit-urgent-intervention-closure/audit-urgent-intervention-closure.component';
import { AuditStageListComponent } from './audit/audit-stage-list/audit-stage-list.component';
import { AuditResultListComponent } from './audit/audit-result-list/audit-result-list.component';
import { AuditImplementationEvaluationListComponent } from './audit/audit-implementation-evaluation-list/audit-implementation-evaluation-list.component';
import { AuditBestPracticesListComponent } from './audit/audit-best-practices-list/audit-best-practices-list.component';
import { AuditLessonsLearntListComponent } from './audit/audit-lessons-learnt-list/audit-lessons-learnt-list.component';

@NgModule({
  declarations: [
    UrgentInterventionClosureComponent,
    UrgentInterventionClosureOutputsComponent,
    StageListComponent,
    ResultListComponent,
    ImplementationEvaluationListComponent,
    BestPracticesListComponent,
    LessonsLearntListComponent,
    UrgentInterventionClosureApproveTaskPopupComponent,
    StageListPopupComponent,
    ResultListPopupComponent,
    ImplementationEvaluationPopupComponent,
    BestPracticesPopupComponent,
    LessonsLearntPopupComponent,
    AuditUrgentInterventionClosureComponent,
    AuditStageListComponent,
    AuditResultListComponent,
    AuditImplementationEvaluationListComponent,
    AuditBestPracticesListComponent,
    AuditLessonsLearntListComponent,
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    SharedServicesModule,
    UrgentInterventionClosureRoutingModule
  ]
})
export class UrgentInterventionClosureModule { }
