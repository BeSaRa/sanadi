import {NgModule} from '@angular/core';

import {UserRoutingModule} from './user-routing.module';
import {UserHomeComponent} from './pages/user-home/user-home.component';
import {SharedModule} from '../shared/shared.module';


@NgModule({
  declarations: [
    UserHomeComponent
  ],
  imports: [
    SharedModule,
    UserRoutingModule
  ]
})
export class UserModule {

}
