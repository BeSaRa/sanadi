import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ProjectModelsRoutingModule} from './project-models-routing.module';
import {ProjectModelOutputsComponent} from './pages/project-model-outputs/project-model-outputs.component';
import {ProjectModelComponent} from '@modules/services/project-models/pages/project-model/project-model.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import {MapsModule} from '@modules/maps/maps.module';
import { ComponentBudgetsComponent } from './pages/project-model/component-budgets/component-budgets.component';
import { ComponentBudgetsPopupComponent } from './pages/project-model/component-budgets/component-budgets-popup/component-budgets-popup.component';
import { EvaluationIndicatorsPopupComponent } from './pages/project-model/evaluation-indicators-popup/evaluation-indicators-popup.component';


@NgModule({
  declarations: [
    ProjectModelComponent,
    ProjectModelOutputsComponent,
    ComponentBudgetsComponent,
    ComponentBudgetsPopupComponent,
    EvaluationIndicatorsPopupComponent,
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
