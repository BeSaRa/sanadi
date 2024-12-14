import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectCompletionRoutingModule } from './project-completion-routing.module';
import { EServicesMainModule } from '@modules/e-services-main/e-services-main.module';
import { SharedServicesModule } from '@modules/services/shared-services/shared-services.module';
import { ProjectCompletionComponent } from './pages/project-completion/project-completion.component';
import { AuditProjectCompletionComponent } from './audit/audit-project-completion/audit-project-completion.component';
import { ProjectCompletionApprovalFormComponent } from './popups/project-completion-approval-form/project-completion-approval-form.component';
import { SelectProjectCompletionPopupComponent } from './popups/select-project-completion-popup/select-project-completion-popup.component';
import { ProjectModelSummaryComponent } from './pages/shared/project-model-summary/project-model-summary.component';
import { ProjectModelsModule } from '../project-models/project-models.module';

@NgModule({
  declarations: [
    ProjectCompletionComponent,
    AuditProjectCompletionComponent,
    ProjectCompletionApprovalFormComponent,
    SelectProjectCompletionPopupComponent,
    ProjectModelSummaryComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    SharedServicesModule,
    ProjectCompletionRoutingModule,
    ProjectModelsModule
  ]
})
export class ProjectCompletionModule {
}
