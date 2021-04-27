import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {UserHomeComponent} from './pages/user-home/user-home.component';
import {UserInquiryComponent} from './pages/user-inquiry/user-inquiry.component';
import {UserRequestComponent} from './pages/user-request/user-request.component';
import {UserRequestSearchComponent} from './pages/user-request-search/user-request-search.component';
import {RequestsUnderProcessComponent} from './pages/requests-under-process/requests-under-process.component';
import {PermissionGuard} from '../guards/permission-guard';
import {CanDeactivateGuard} from '../guards/can-deactivate.guard';
import {PartialRequestComponent} from './pages/partial-requests/partial-request/partial-request.component';

const routes: Routes = [
  {path: '', component: UserHomeComponent},
  {
    path: 'inquiry', component: UserInquiryComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'BEN_SEARCH'}
  },
  {
    path: 'request', component: UserRequestComponent,
    canActivate: [PermissionGuard],
    canDeactivate: [CanDeactivateGuard],
    data: {permissionKey: 'SUBVENTION_ADD'}
  },
  {
    path: 'request/:id', component: UserRequestComponent,
    canActivate: [PermissionGuard],
    canDeactivate: [CanDeactivateGuard],
    data: {permissionKey: 'EDIT_SUBVENTION_REQUEST'}
  },
  {
    path: 'partial-requests', component: PartialRequestComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'PARTIAL_SUBVENTION_REQUESTS_MAIL'}
  },
  {
    path: 'request-search', component: UserRequestSearchComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'SUBVENTION_SEARCH'}
  },
  {
    path: 'requests-under-process', component: RequestsUnderProcessComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'UNDER_PROCESSING_REQUESTS'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {
}
