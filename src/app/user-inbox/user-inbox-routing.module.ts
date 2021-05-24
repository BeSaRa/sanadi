import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {UserInboxComponent} from './pages/user-inbox/user-inbox.component';

const routes: Routes = [
  {path: '', component: UserInboxComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserInboxRoutingModule {
}
