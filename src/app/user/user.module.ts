import {NgModule} from '@angular/core';

import {UserRoutingModule} from './user-routing.module';
import {UserHomeComponent} from './pages/user-home/user-home.component';
import {SharedModule} from '../shared/shared.module';
import {UserRequestComponent} from './pages/user-request/user-request.component';
import {UserInquiryComponent} from './pages/user-inquiry/user-inquiry.component';
import {SelectBeneficiaryPopupComponent} from './popups/select-beneficiary-popup/select-beneficiary-popup.component';
import {UserRequestSearchComponent} from './pages/user-request-search/user-request-search.component';
import {SubventionLogPopupComponent} from './popups/subvention-log-popup/subvention-log-popup.component';
import {SubventionAidPopupComponent} from './popups/subvention-aid-popup/subvention-aid-popup.component';
import {RequestsUnderProcessComponent} from './pages/requests-under-process/requests-under-process.component';
import {ReasonPopupComponent} from './popups/reason-popup/reason-popup.component';


@NgModule({
  declarations: [
    UserHomeComponent,
    UserRequestComponent,
    UserInquiryComponent,
    SelectBeneficiaryPopupComponent,
    UserRequestSearchComponent,
    SubventionLogPopupComponent,
    SubventionAidPopupComponent,
    RequestsUnderProcessComponent,
    ReasonPopupComponent],
  imports: [
    SharedModule,
    UserRoutingModule
  ]
})
export class UserModule {

}
