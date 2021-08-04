import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SanadyComponent} from './sanady.component';

import {PermissionGuard} from "../guards/permission-guard";
import {CookieGuard} from "../guards/cookie.guard";
import {isEmptyObject, isValidValue, objectHasValue} from "../helpers/utils";
import {CanDeactivateGuard} from "../guards/can-deactivate.guard";
import {PartialRequestComponent} from "./pages/partial-requests/partial-request/partial-request.component";
import {UserInquiryComponent} from "./pages/user-inquiry/user-inquiry.component";
import {UserRequestComponent} from "./pages/user-request/user-request.component";
import {PartialRequestReportsComponent} from "./pages/partial-request-reports/partial-request-reports.component";
import {UserRequestSearchComponent} from "./pages/user-request-search/user-request-search.component";
import {RequestsUnderProcessComponent} from "./pages/requests-under-process/requests-under-process.component";


const routes: Routes = [
  {path: '', component: SanadyComponent},
  {
    path: 'inquiries', component: UserInquiryComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'BEN_SEARCH', routeName: 'inquiries'},
  },
  {
    path: 'inquiry', component: UserInquiryComponent,
    canActivate: [PermissionGuard, CookieGuard],
    data: {
      permissionKey: 'SUBVENTION_AID_SEARCH',
      routeName: 'inquiry',
      cookieKey: 'b_i_d',
      validateCookie: (value: any) => {
        return !(!isValidValue(value) || isEmptyObject(value) || !objectHasValue(value) || !value.idNumber);
      }
    }
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
    path: 'request/partial/:partial-id', component: UserRequestComponent,
    canActivate: [PermissionGuard],
    canDeactivate: [CanDeactivateGuard],
    data: {permissionKey: 'SUBVENTION_ADD'}
  },
  {
    path: 'partial-requests', component: PartialRequestComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'PARTIAL_SUBVENTION_REQUESTS_MAIL'}
  },
  {
    path: 'partial-request-reports', component: PartialRequestReportsComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'PARTIAL_SUBVENTION_REQUESTS_REPORT'}
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
export class SanadyRoutingModule {
}
