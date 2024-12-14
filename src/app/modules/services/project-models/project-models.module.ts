import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EServicesMainModule } from '@modules/e-services-main/e-services-main.module';
import { MapsModule } from '@modules/maps/maps.module';
import { AuditEvaluationIndicatorComponent } from './audit/audit-evaluation-indicator/audit-evaluation-indicator.component';
import { AuditProjectAddressComponent } from './audit/audit-project-address/audit-project-address.component';
import { AuditProjectComponentComponent } from './audit/audit-project-component/audit-project-component.component';
import { AuditProjectModelForeignCountriesProjectComponent } from './audit/audit-project-model-foreign-countries-project/audit-project-model-foreign-countries-project.component';
import { AuditProjectModelsComponent } from './audit/audit-project-models/audit-project-models.component';
import { ProjectModelOutputsComponent } from './pages/project-model-outputs/project-model-outputs.component';
import { ProjectModelsRoutingModule } from './project-models-routing.module';
import { ProjectPreviewModuleModule } from './project-preview-module.module';
import { ProjectModelComponent } from './pages/project-model/project-model.component';


@NgModule({
  declarations: [
    ProjectModelOutputsComponent,
    AuditProjectModelsComponent,
    AuditEvaluationIndicatorComponent,
    AuditProjectAddressComponent,
    AuditProjectComponentComponent,
    AuditProjectModelForeignCountriesProjectComponent,
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    MapsModule,
    ProjectModelsRoutingModule,
    ProjectPreviewModuleModule
  ],
  exports:[    ProjectModelComponent,
  ]
})
export class ProjectModelsModule {
}
