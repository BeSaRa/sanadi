import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {EServicesComponent} from './e-services.component';
import {InquiriesComponent} from './pages/inquiries/inquiries.component';

const routes: Routes = [
  {path: '', component: EServicesComponent},
  {path: 'inquiries', component: InquiriesComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EServicesRoutingModule {
}
