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
import { TrainingProgramAttendancePopupComponent } from './popups/training-program-attendance-popup/training-program-attendance-popup.component';
import { TraineePopupComponent } from './popups/trainee-popup/trainee-popup.component';
import { TrainingProgramAddCandidatePopupComponent } from './popups/training-program-add-candidate-popup/training-program-add-candidate-popup.component';
import { AvailableProgramsComponent } from './pages/available-programs/available-programs.component';
import { TrainingProgramCandidatesPopupComponent } from './popups/training-program-candidates-popup/training-program-candidates-popup.component';



@NgModule({
  declarations: [
    TrainingServicesComponent,
    AccreditedTrainerComponent,
    AccreditedTrainerPopupComponent,
    TrainerCvPopupComponent,
    TrainingProgramComponent,
    TrainingProgramPopupComponent,
    FilterTrainingProgramsComponent,
    TrainingProgramAttendancePopupComponent,
    TraineePopupComponent,
    TrainingProgramAddCandidatePopupComponent,
    AvailableProgramsComponent,
    TrainingProgramCandidatesPopupComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TrainingServicesRoutingModule,
    FormsModule
  ]
})
export class TrainingServicesModule { }
