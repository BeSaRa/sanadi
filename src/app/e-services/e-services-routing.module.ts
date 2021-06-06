import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {EServicesComponent} from './e-services.component';
import {InquiryContainerComponent} from './pages/inquiry-container/inquiry-container.component';
import {ConsultationContainerComponent} from './pages/consultation-container/consultation-container.component';

const routes: Routes = [
  {path: '', component: EServicesComponent},
  {path: 'inquiries', component: InquiryContainerComponent},
  {path: 'consultations', component: ConsultationContainerComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EServicesRoutingModule {
}
