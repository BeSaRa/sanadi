import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from '@app/shared/shared.module';
import {TrainingServicesRoutingModule} from '@app/training-services/training-services-routing.module';
import { TrainingServicesComponent } from './training-services.component';
import { AccreditedTrainerComponent } from './pages/accredited-trainer/accredited-trainer.component';
import { TrainerPopupComponent } from './popups/trainer-popup/trainer-popup.component';



@NgModule({
  declarations: [
    TrainingServicesComponent,
    AccreditedTrainerComponent,
    TrainerPopupComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TrainingServicesRoutingModule
  ]
})
export class TrainingServicesModule { }
