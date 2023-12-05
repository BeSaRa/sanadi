import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectModelPreviewComponent } from './popups/project-model-preview/project-model-preview.component';
import { ProjectModelComponent } from './pages/project-model/project-model.component';
import { ComponentBudgetsComponent } from './pages/project-model/component-budgets/component-budgets.component';
import { ComponentBudgetsPopupComponent } from './popups/component-budgets-popup/component-budgets-popup.component';
import { EvaluationIndicatorsComponent } from './pages/project-model/evaluation-indicators/evaluation-indicators.component';
import { EvaluationIndicatorsPopupComponent } from './popups/evaluation-indicators-popup/evaluation-indicators-popup.component';
import { ForeignCountriesProjectsComponent } from './pages/project-model/foreign-countries-projects/foreign-countries-projects.component';
import { ForeignCountriesProjectPopupComponent } from './popups/foreign-countries-project-popup/foreign-countries-project-popup.component';
import { ProjectAddressesComponent } from './pages/project-model/project-addresses/project-addresses.component';
import { ProjectAddressesPopupComponent } from './popups/project-addresses-popup/project-addresses-popup.component';
import { EServicesMainModule } from '@app/modules/e-services-main/e-services-main.module';

@NgModule({
  declarations: [
    ProjectModelComponent,
    ProjectModelPreviewComponent,
    ComponentBudgetsComponent,
    ComponentBudgetsPopupComponent,
    EvaluationIndicatorsComponent,
    EvaluationIndicatorsPopupComponent,
    ForeignCountriesProjectsComponent,
    ForeignCountriesProjectPopupComponent,
    ProjectAddressesComponent,
    ProjectAddressesPopupComponent,

  ],
  imports: [
    CommonModule,
    EServicesMainModule,
  ],
  exports: [
    ProjectModelComponent,
    ProjectModelPreviewComponent,
  ],
})
export class ProjectPreviewModuleModule { }
