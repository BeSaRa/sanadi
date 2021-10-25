import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from '@app/shared/shared.module';
import {TrainingServicesRoutingModule} from '@app/training-services/training-services-routing.module';
import { TrainingServicesComponent } from './training-services.component';
import { AccreditedTrainerComponent } from './pages/accredited-trainer/accredited-trainer.component';
import { AccreditedTrainerPopupComponent } from './popups/accredited-trainer-popup/accredited-trainer-popup.component';
import { TrainerCvPopupComponent } from './popups/trainer-cv-popup/trainer-cv-popup.component';



@NgModule({
  declarations: [
    TrainingServicesComponent,
    AccreditedTrainerComponent,
    AccreditedTrainerPopupComponent,
    TrainerCvPopupComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TrainingServicesRoutingModule
  ]
})
export class TrainingServicesModule { }
