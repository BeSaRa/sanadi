import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '@app/shared/shared.module';
import {IntegrationInquiriesComponent} from './integration-inquiries/integration-inquiries.component';
import {
  IntegrationInquiryLogListComponent
} from './integration-inquiry-log-list/integration-inquiry-log-list.component';
import {MojFlatListComponent} from '@app/modules/gdx-integration/related-data/moj-flat-list/moj-flat-list.component';
import {
  MojParcelListComponent
} from '@app/modules/gdx-integration/related-data/moj-parcel-list/moj-parcel-list.component';
import {
  MawaredEmployeeListComponent
} from '@app/modules/gdx-integration/related-data/mawared-employee-list/mawared-employee-list.component';
import {
  MociCompanyListComponent
} from '@app/modules/gdx-integration/related-data/moci-company-list/moci-company-list.component';
import {GarsiaPensionListComponent} from './related-data/garsia-pension-list/garsia-pension-list.component';
import {
  GarsiaPensionPaymentListComponent
} from './related-data/garsia-pension-payment-list/garsia-pension-payment-list.component';
import {
  KahramaaOutstandingPaymentListComponent
} from './related-data/kahramaa-outstanding-payment-list/kahramaa-outstanding-payment-list.component';
import {MolRelatedDataListComponent} from './related-data/mol-related-data-list/mol-related-data-list.component';
import { SjcRelatedDataListComponent } from './related-data/sjc-related-data-list/sjc-related-data-list.component';
import { MoeInstallmentsComponent } from './related-data/moe-installments/moe-installments.component';
import { MoePendingPaymentComponent } from './related-data/moe-pending-payment/moe-pending-payment.component';
import { MoeStudentInfoComponent } from './related-data/moe-student-info/moe-student-info.component';

@NgModule({
  declarations: [
    IntegrationInquiriesComponent,
    IntegrationInquiryLogListComponent,
    MojFlatListComponent,
    MojParcelListComponent,
    MociCompanyListComponent,
    MawaredEmployeeListComponent,
    GarsiaPensionListComponent,
    GarsiaPensionPaymentListComponent,
    KahramaaOutstandingPaymentListComponent,
    MolRelatedDataListComponent,
    SjcRelatedDataListComponent,
    MoeInstallmentsComponent,
    MoePendingPaymentComponent,
    MoeStudentInfoComponent
  ],
  exports: [
    IntegrationInquiriesComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ]
})
export class GdxIntegrationModule {
}
