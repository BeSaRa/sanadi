import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EServicesMainModule } from '@app/modules/e-services-main/e-services-main.module';
import { FinancialAnalysisComponent } from './pages/financial-analysis/financial-analysis.component';
import { FinancialAnalysisOutputComponent } from './pages/financial-analysis-output/financial-analysis-output.component';
import { FinancialAnalysisRoutingModule } from './financial-analysis-routing.module';
import { FinancialAnalysisApprovePopupComponent } from './popups/financial-analysis-approve-popup/financial-analysis-approve-popup.component';

@NgModule({
  imports: [
    CommonModule,
    EServicesMainModule,
    FinancialAnalysisRoutingModule
  ],
  declarations: [
    FinancialAnalysisComponent,
    FinancialAnalysisOutputComponent,
    FinancialAnalysisApprovePopupComponent
  ]
})
export class FinancialAnalysisModule { }
