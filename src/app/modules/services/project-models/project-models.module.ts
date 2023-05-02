import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectModelsRoutingModule } from './project-models-routing.module';
import { ProjectModelOutputsComponent } from './pages/project-model-outputs/project-model-outputs.component';
import { ProjectModelComponent } from '@modules/services/project-models/pages/project-model/project-model.component';
import { EServicesMainModule } from '@modules/e-services-main/e-services-main.module';
import { MapsModule } from '@modules/maps/maps.module';
import { ComponentBudgetsComponent } from './pages/project-model/component-budgets/component-budgets.component';
import { ComponentBudgetsPopupComponent } from './popups/component-budgets-popup/component-budgets-popup.component';
import { EvaluationIndicatorsPopupComponent } from './popups/evaluation-indicators-popup/evaluation-indicators-popup.component';
import { ForeignCountriesProjectPopupComponent } from './popups/foreign-countries-project-popup/foreign-countries-project-popup.component';
import { EvaluationIndicatorsComponent } from './pages/project-model/evaluation-indicators/evaluation-indicators.component';
import { AuditProjectModelsComponent } from './audit/audit-project-models/audit-project-models.component';
import { AuditEvaluationIndicatorComponent } from './audit/audit-evaluation-indicator/audit-evaluation-indicator.component';
import { AuditProjectAddressComponent } from './audit/audit-project-address/audit-project-address.component';
import { AuditProjectComponentComponent } from './audit/audit-project-component/audit-project-component.component';
import { AuditProjectModelForeignCountriesProjectComponent } from './audit/audit-project-model-foreign-countries-project/audit-project-model-foreign-countries-project.component';


@NgModule({
  declarations: [
    ProjectModelComponent,
    ProjectModelOutputsComponent,
    ComponentBudgetsComponent,
    ComponentBudgetsPopupComponent,
    EvaluationIndicatorsPopupComponent,
    ForeignCountriesProjectPopupComponent,
    EvaluationIndicatorsComponent,
    AuditProjectModelsComponent,
    AuditEvaluationIndicatorComponent,
    AuditProjectAddressComponent,
    AuditProjectComponentComponent,
    AuditProjectModelForeignCountriesProjectComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    MapsModule,
    ProjectModelsRoutingModule
  ]
})
export class ProjectModelsModule {
}
