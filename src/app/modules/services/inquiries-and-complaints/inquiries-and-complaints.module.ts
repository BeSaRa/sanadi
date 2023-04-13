import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InquiriesAndComplaintsRoutingModule } from './inquiries-and-complaints-routing.module';
import { InquiryAndComplaintOutputsComponent } from './pages/inquiry-and-complaint-outputs/inquiry-and-complaint-outputs.component';
import {InquiryComponent} from '@modules/services/inquiries-and-complaints/pages/inquiry/inquiry.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import { AuditInquiryAndComplaintComponent } from './audit/audit-inquiry-and-complaint/audit-inquiry-and-complaint.component';


@NgModule({
  declarations: [
    InquiryComponent,
    InquiryAndComplaintOutputsComponent,
    AuditInquiryAndComplaintComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    InquiriesAndComplaintsRoutingModule
  ]
})
export class InquiriesAndComplaintsModule { }
