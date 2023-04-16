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
import { StageListPopupComponent } from './pages/urgent-intervention-closure/components/stage-list/stage-list-popup/stage-list-popup.component';
import { ResultListPopupComponent } from './pages/urgent-intervention-closure/components/result-list/result-list-popup/result-list-popup.component';
import { ImplementationEvaluationPopupComponent } from './pages/urgent-intervention-closure/components/implementation-evaluation-list/implementation-evaluation-popup/implementation-evaluation-popup.component';
import { BestPracticesPopupComponent } from './pages/urgent-intervention-closure/components/best-practices-list/best-practices-popup/best-practices-popup.component';

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
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    SharedServicesModule,
    UrgentInterventionClosureRoutingModule
  ]
})
export class UrgentInterventionClosureModule { }
