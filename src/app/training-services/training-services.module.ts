import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from '@app/shared/shared.module';
import {TrainingServicesRoutingModule} from '@app/training-services/training-services-routing.module';
import { TrainingServicesComponent } from './training-services.component';
import { AccreditedTrainerComponent } from './pages/accredited-trainer/accredited-trainer.component';
import { AccreditedTrainerPopupComponent } from './popups/accredited-trainer-popup/accredited-trainer-popup.component';
import { ViewDocumentPopupComponent } from './popups/view-document-popup/view-document-popup.component';
import { TrainingProgramComponent } from './pages/training-program/training-program.component';
import { TrainingProgramPopupComponent } from './popups/training-program-popup/training-program-popup.component';
import {FormsModule} from '@angular/forms';
import { FilterTrainingProgramsComponent } from './popups/filter-training-programs/filter-training-programs.component';
import { TrainingProgramAttendancePopupComponent } from './popups/training-program-attendance-popup/training-program-attendance-popup.component';
import { TrainingProgramTraineePopupComponent } from './popups/training-program-trainee-popup/training-program-trainee-popup.component';
import { AvailableProgramsComponent } from './pages/available-programs/available-programs.component';
import { TrainingProgramCandidatesPopupComponent } from './popups/training-program-candidates-popup/training-program-candidates-popup.component';
import { TrainingBriefcasesPopupComponent } from './popups/training-briefcases-popup/training-briefcases-popup.component';
import { TrainingBriefcasesComponent } from './pages/training-briefcases/training-briefcases.component';
import { RejectTraineePopupComponent } from './popups/reject-trainee-popup/reject-trainee-popup.component';
import { CertificatesComponent } from './pages/certificates/certificates.component';
import { CertificatePopupComponent } from './popups/certificate-popup/certificate-popup.component';



@NgModule({
  declarations: [
    TrainingServicesComponent,
    AccreditedTrainerComponent,
    AccreditedTrainerPopupComponent,
    ViewDocumentPopupComponent,
    TrainingProgramComponent,
    TrainingProgramPopupComponent,
    FilterTrainingProgramsComponent,
    TrainingProgramAttendancePopupComponent,
    TrainingProgramTraineePopupComponent,
    AvailableProgramsComponent,
    TrainingProgramCandidatesPopupComponent,
    TrainingBriefcasesPopupComponent,
    TrainingBriefcasesComponent,
    RejectTraineePopupComponent,
    CertificatesComponent,
    CertificatePopupComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TrainingServicesRoutingModule,
    FormsModule
  ]
})
export class TrainingServicesModule { }
