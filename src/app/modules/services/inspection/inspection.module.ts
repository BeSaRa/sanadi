import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ProcessFieldWrapperComponent } from '@app/administration/popups/general-process-popup/process-formly-components/process-field-wrapper/process-field-wrapper.component';
import { EServicesMainModule } from '@app/modules/e-services-main/e-services-main.module';
import { FormlyDateFieldComponent } from '@app/services-search/components/formly-date-field/formly-date-field.component';
import { FormlyFieldFullWrapperComponent } from '@app/services-search/components/formly-field-full-wrapper/formly-field-full-wrapper.component';
import { FormlyFieldWrapperComponent } from '@app/services-search/components/formly-field-wrapper/formly-field-wrapper.component';
import { FormlyMaskInputFieldComponent } from '@app/services-search/components/formly-mask-input-field/formly-mask-input-field.component';
import { FormlySelectFieldComponent } from '@app/services-search/components/formly-select-field/formly-select-field.component';
import { SharedModule } from '@app/shared/shared.module';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { FormlyModule } from '@ngx-formly/core';
import { InspectionRoutingModule } from './inspection-routing.module';
import { ActivityImplementationComponent } from './pages/activity-implementation/activity-implementation.component';
import { ActualInspectionComponent } from './pages/actual-inspection/actual-inspection.component';
import { LicenseActivityComponent } from './pages/license-activity/license-activity.component';
import { ProposedInspectionComponent } from './pages/proposed-inspection/proposed-inspection.component';
import { ActualInspectionPopupComponent } from './popups/actual-inspection-popup/actual-inspection-popup.component';
import { ExternalSpecialistPopupComponent } from './popups/external-specialist-popup/external-specialist-popup.component';
import { InspectionSpecialistsPopupComponent } from './popups/inspection-specialists-popup/inspection-specialists-popup.component';
import { LicenseActivityCompletePopupComponent } from './popups/license-activity-complete-popup/license-activity-complete-popup.component';
import { LicenseActivityPopupComponent } from './popups/license-activity-popup/license-activity-popup.component';
import { ManageInspectionPopupComponent } from './popups/manage-inspection-popup/manage-inspection-popup.component';
import { ProposedInspectionPopupComponent } from './popups/proposed-inspection-popup/proposed-inspection-popup.component';
import { SelectLicenseActivityPopupComponent } from './popups/select-license-activity-popup/select-license-activity-popup.component';
import { InspectionSpecialistsComponent } from './shared/inspection-specialists/inspection-specialists.component';
import { LicenseActivitiesComponent } from './shared/license-activities/license-activities.component';
import { ManageInspectionSpecialistsComponent } from './shared/manage-inspection-specialists/manage-inspection-specialists.component';
import { ManageLicenseActivitiesComponent } from './shared/manage-license-activities/manage-license-activities.component';
import { InspectionLogsPopupComponent } from './popups/inspection-logs-popup/inspection-logs-popup.component';

@NgModule({
  imports: [
    CommonModule,
    EServicesMainModule,
    InspectionRoutingModule,
    SharedModule,
    FormlyBootstrapModule,
    FormlyModule.forChild({
      types: [
        {name: 'dateField', component: FormlyDateFieldComponent, wrappers: ['custom-wrapper','col-md-4-8']},
        {name: 'selectField', component: FormlySelectFieldComponent, wrappers: ['custom-wrapper','col-md-4-8']},
        {name: 'yesOrNo', component: FormlySelectFieldComponent, wrappers: ['custom-wrapper','col-md-4-8']},
        {name: 'maskInput', extends: 'input', component: FormlyMaskInputFieldComponent, wrappers: ['custom-wrapper','col-md-4-8']},
        {name: 'number', extends: 'input', component: FormlyMaskInputFieldComponent, wrappers: ['custom-wrapper','col-md-4-8']},
        {name: 'textarea', wrappers: ['custom-wrapper','col-md-4-8']},
      ],
      wrappers: [
        {name: 'custom-wrapper', component: ProcessFieldWrapperComponent},
        {name: 'col-md-4-8', component: FormlyFieldWrapperComponent},
        {name: 'col-md-2-10', component: FormlyFieldFullWrapperComponent}
      ]
    }),
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
    LicenseActivityCompletePopupComponent,
    InspectionLogsPopupComponent
  ],

})
export class InspectionModule { }
