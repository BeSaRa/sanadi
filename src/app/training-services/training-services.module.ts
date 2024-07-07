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
import { TrainingBriefcasePopupComponent } from './popups/training-briefcase-popup/training-briefcase-popup.component';
import { TrainingBriefcaseComponent } from './pages/training-briefcase/training-briefcase.component';
import { RejectTraineePopupComponent } from './popups/reject-trainee-popup/reject-trainee-popup.component';
import { CertificatesComponent } from './pages/certificates/certificates.component';
import { CertificatePopupComponent } from './popups/certificate-popup/certificate-popup.component';
import { TraineeListComponent } from './popups/trainee-list/trainee-list.component';
import { SelectCertificateTemplatePopupComponent } from './popups/select-certificate-template-popup/select-certificate-template-popup.component';
import { TrainingProgramViewAttendanceComponent } from './popups/training-program-view-attendance/training-program-view-attendance.component';
import { SelectProgramSurveyPopupComponent } from './popups/select-program-survey-popup/select-program-survey-popup.component';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';



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
    TrainingBriefcasePopupComponent,
    TrainingBriefcaseComponent,
    RejectTraineePopupComponent,
    CertificatesComponent,
    CertificatePopupComponent,
    TraineeListComponent,
    SelectCertificateTemplatePopupComponent,
    TrainingProgramViewAttendanceComponent,
    SelectProgramSurveyPopupComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TrainingServicesRoutingModule,
    FormsModule,
    NgxMaskDirective,
    NgxMaskPipe
  ]
})
export class TrainingServicesModule { }
