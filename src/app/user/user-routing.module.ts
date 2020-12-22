import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {UserHomeComponent} from './pages/user-home/user-home.component';
import {UserInquiryComponent} from './pages/user-inquiry/user-inquiry.component';
import {UserRequestComponent} from './pages/user-request/user-request.component';

const routes: Routes = [
  {path: '', component: UserHomeComponent},
  {path: 'inquiry', component: UserInquiryComponent},
  {path: 'request', component: UserRequestComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {
}
