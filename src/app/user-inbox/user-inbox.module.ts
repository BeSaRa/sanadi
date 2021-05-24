import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {UserInboxRoutingModule} from './user-inbox-routing.module';
import {SharedModule} from '../shared/shared.module';
import {UserInboxComponent} from './pages/user-inbox/user-inbox.component';

@NgModule({
  declarations: [
    UserInboxComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    UserInboxRoutingModule
  ]
})
export class UserInboxModule {
}
