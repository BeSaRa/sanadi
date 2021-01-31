import {NgModule} from '@angular/core';

import {UserRoutingModule} from './user-routing.module';
import {UserHomeComponent} from './pages/user-home/user-home.component';
import {SharedModule} from '../shared/shared.module';
import {UserRequestComponent} from './pages/user-request/user-request.component';
import {UserInquiryComponent} from './pages/user-inquiry/user-inquiry.component';
import { SelectBeneficiaryPopupComponent } from './popups/select-beneficiary-popup/select-beneficiary-popup.component';


@NgModule({
  declarations: [UserHomeComponent, UserRequestComponent, UserInquiryComponent, SelectBeneficiaryPopupComponent],
  imports: [
    SharedModule,
    UserRoutingModule
  ]
})
export class UserModule {

}
