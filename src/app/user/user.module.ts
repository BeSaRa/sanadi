import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {UserRoutingModule} from './user-routing.module';
import {UserHomeComponent} from './pages/user-home/user-home.component';
import {SharedModule} from '../shared/shared.module';
import {UserRequestComponent} from './pages/user-request/user-request.component';
import {UserInquiryComponent} from './pages/user-inquiry/user-inquiry.component';


@NgModule({
  declarations: [UserHomeComponent, UserRequestComponent, UserInquiryComponent],
  imports: [
    CommonModule,
    SharedModule,
    UserRoutingModule
  ]
})
export class UserModule {

}
