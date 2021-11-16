import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from '@app/shared/shared.module';
import {TrainingServicesRoutingModule} from '@app/training-services/training-services-routing.module';
import { TrainingServicesComponent } from './training-services.component';
import { AccreditedTrainerComponent } from './pages/accredited-trainer/accredited-trainer.component';
import { AccreditedTrainerPopupComponent } from './popups/accredited-trainer-popup/accredited-trainer-popup.component';
import { TrainerCvPopupComponent } from './popups/trainer-cv-popup/trainer-cv-popup.component';
import { TrainingProgramComponent } from './pages/training-program/training-program.component';
import { TrainingProgramPopupComponent } from './popups/training-program-popup/training-program-popup.component';
import {FormsModule} from '@angular/forms';
import { FilterTrainingProgramsComponent } from './popups/filter-training-programs/filter-training-programs.component';



@NgModule({
  declarations: [
    TrainingServicesComponent,
    AccreditedTrainerComponent,
    AccreditedTrainerPopupComponent,
    TrainerCvPopupComponent,
    TrainingProgramComponent,
    TrainingProgramPopupComponent,
    FilterTrainingProgramsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TrainingServicesRoutingModule,
    FormsModule
  ]
})
export class TrainingServicesModule { }
