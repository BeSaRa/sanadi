import { NgModule } from '@angular/core';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import { SharedModule } from "@app/shared/shared.module";
import { ReportDetailsComponent } from './report-details/report-details.component';


@NgModule({
  declarations: [
    ReportsComponent,
    ReportDetailsComponent
  ],
  imports: [
    SharedModule,
    ReportsRoutingModule
  ]
})
export class ReportsModule { }
