import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EServicesMainModule } from '@app/modules/e-services-main/e-services-main.module';
import { SharedModule } from '@app/shared/shared.module';
import { InspectionRoutingModule } from './inspection-routing.module';
import { ActivityImplementationComponent } from './pages/activity-implementation/activity-implementation.component';
import { ActualInspectionComponent } from './pages/actual-inspection/actual-inspection.component';
import { LicenseActivityComponent } from './pages/license-activity/license-activity.component';
import { ProposedInspectionComponent } from './pages/proposed-inspection/proposed-inspection.component';
import { ActualInspectionPopupComponent } from './popups/actual-inspection-popup/actual-inspection-popup.component';
import { ExternalSpecialistPopupComponent } from './popups/external-specialist-popup/external-specialist-popup.component';
import { InspectionSpecialistsPopupComponent } from './popups/inspection-specialists-popup/inspection-specialists-popup.component';
import { LicenseActivityPopupComponent } from './popups/license-activity-popup/license-activity-popup.component';
import { ManageInspectionPopupComponent } from './popups/manage-inspection-popup/manage-inspection-popup.component';
import { ProposedInspectionPopupComponent } from './popups/proposed-inspection-popup/proposed-inspection-popup.component';
import { SelectLicenseActivityPopupComponent } from './popups/select-license-activity-popup/select-license-activity-popup.component';
import { InspectionSpecialistsComponent } from './shared/inspection-specialists/inspection-specialists.component';
import { LicenseActivitiesComponent } from './shared/license-activities/license-activities.component';
import { ManageInspectionSpecialistsComponent } from './shared/manage-inspection-specialists/manage-inspection-specialists.component';
import { ManageLicenseActivitiesComponent } from './shared/manage-license-activities/manage-license-activities.component';
import { LicenseActivityCompletePopupComponent } from './popups/license-activity-complete-popup/license-activity-complete-popup.component';

@NgModule({
  imports: [
    CommonModule,
    EServicesMainModule,
    InspectionRoutingModule,
    SharedModule,
  ],
  declarations: [
    ActualInspectionComponent,
    ProposedInspectionComponent,
    ProposedInspectionPopupComponent,
    ActualInspectionPopupComponent,
    LicenseActivitiesComponent,
    LicenseActivityPopupComponent,
    SelectLicenseActivityPopupComponent,
    InspectionSpecialistsComponent,
    InspectionSpecialistsPopupComponent,
    ExternalSpecialistPopupComponent,
    LicenseActivityComponent,
    ActivityImplementationComponent,
    ManageInspectionPopupComponent,
    ManageLicenseActivitiesComponent,
    ManageInspectionSpecialistsComponent,
    LicenseActivityCompletePopupComponent
  ],

})
export class InspectionModule { }
