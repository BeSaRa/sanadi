import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {EServicesComponent} from '@app/e-services/e-services.component';
import {InquiryContainerComponent} from '@app/e-services/pages/inquiry-container/inquiry-container.component';
import {ConsultationContainerComponent} from '@app/e-services/pages/consultation-container/consultation-container.component';
import {InternationalCooperationContainerComponent} from '@app/e-services/pages/international-cooperation-container/international-cooperation-container.component';
import {InitialExternalOfficeApprovalComponent} from "@app/e-services/pages/initial-external-office-approval/initial-external-office-approval.component";

const routes: Routes = [
  {path: '', component: EServicesComponent},
  {path: 'inquiries', component: InquiryContainerComponent},
  {path: 'consultations', component: ConsultationContainerComponent},
  {path: 'international-coop', component: InternationalCooperationContainerComponent},
  {path: 'initial-external-office-approval', component: InitialExternalOfficeApprovalComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EServicesRoutingModule {
}
