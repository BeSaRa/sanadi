import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportsComponent } from './reports.component';
import { ReportDetailsComponent } from "@app/modules/reports/report-details/report-details.component";

const routes: Routes = [
  { path: '', component: ReportsComponent },
  { path: 'details/:url', component: ReportDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule {}
