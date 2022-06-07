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
import {Permissions} from '@app/enums/Permissions';
import {InquiryLogsComponent} from '@app/sanady/pages/inquiry-logs/inquiry-logs.component';


const routes: Routes = [
  {path: '', component: SanadyComponent},
  {
    path: 'inquiries', component: UserInquiryComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'BEN_SEARCH', configPermissionGroup: null,  checkAnyPermission: false, routeName: 'inquiries'},
  },
  {
    path: 'inquiry', component: UserInquiryComponent,
    canActivate: [PermissionGuard, CookieGuard],
    data: {
      permissionKey: 'SUBVENTION_AID_SEARCH', configPermissionGroup: null,  checkAnyPermission: false,
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
    data: {permissionKey: 'SUBVENTION_ADD', configPermissionGroup: null,  checkAnyPermission: false}
  },
  {
    path: 'request/:id', component: UserRequestComponent,
    canActivate: [PermissionGuard],
    canDeactivate: [CanDeactivateGuard],
    data: {permissionKey: 'EDIT_SUBVENTION_REQUEST', configPermissionGroup: null,  checkAnyPermission: false}
  },
  {
    path: 'request/partial/:partial-id', component: UserRequestComponent,
    canActivate: [PermissionGuard],
    canDeactivate: [CanDeactivateGuard],
    data: {permissionKey: 'SUBVENTION_ADD', configPermissionGroup: null,  checkAnyPermission: false}
  },
  {
    path: 'partial-requests', component: PartialRequestComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'PARTIAL_SUBVENTION_REQUESTS_MAIL', configPermissionGroup: null,  checkAnyPermission: false}
  },
  {
    path: 'partial-request-reports', component: PartialRequestReportsComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'PARTIAL_SUBVENTION_REQUESTS_REPORT', configPermissionGroup: null,  checkAnyPermission: false}
  },
  {
    path: 'request-search', component: UserRequestSearchComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'SUBVENTION_SEARCH', configPermissionGroup: null,  checkAnyPermission: false}
  },
  {
    path: 'requests-under-process', component: RequestsUnderProcessComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'UNDER_PROCESSING_REQUESTS', configPermissionGroup: null,  checkAnyPermission: false}
  },
  {
    path: 'inquiry-logs', component: InquiryLogsComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: Permissions.INQUIRY_LOGS, configPermissionGroup: null,  checkAnyPermission: false}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SanadyRoutingModule {
}
