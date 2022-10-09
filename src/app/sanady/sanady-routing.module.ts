import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SanadyComponent} from './sanady.component';

import {PermissionGuard} from '../guards/permission-guard';
import {CookieGuard} from '../guards/cookie.guard';
import {isEmptyObject, isValidValue, objectHasValue} from '@helpers/utils';
import {CanDeactivateGuard} from '../guards/can-deactivate.guard';
import {PartialRequestComponent} from './pages/partial-requests/partial-request/partial-request.component';
import {UserInquiryComponent} from './pages/user-inquiry/user-inquiry.component';
import {UserRequestComponent} from './pages/user-request/user-request.component';
import {PartialRequestReportsComponent} from './pages/partial-request-reports/partial-request-reports.component';
import {UserRequestSearchComponent} from './pages/user-request-search/user-request-search.component';
import {RequestsUnderProcessComponent} from './pages/requests-under-process/requests-under-process.component';
import {PermissionsEnum} from '@app/enums/permissions-enum';
import {InquiryLogsComponent} from '@app/sanady/pages/inquiry-logs/inquiry-logs.component';


const routes: Routes = [
  {path: '', component: SanadyComponent},
  {
    path: 'inquiries', component: UserInquiryComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: PermissionsEnum.SANADI_SEARCH_BENEFICIARY, configPermissionGroup: null,  checkAnyPermission: false, routeName: 'inquiries'},
  },
  {
    path: 'inquiry', component: UserInquiryComponent,
    canActivate: [PermissionGuard, CookieGuard],
    data: {
      permissionKey: PermissionsEnum.SANADI_SEARCH_AID, configPermissionGroup: null,  checkAnyPermission: false,
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
    data: {permissionKey: PermissionsEnum.SANADI_ADD_REQUEST, configPermissionGroup: null,  checkAnyPermission: false}
  },
  {
    path: 'request/:id', component: UserRequestComponent,
    canActivate: [PermissionGuard],
    canDeactivate: [CanDeactivateGuard],
    data: {permissionKey: PermissionsEnum.SANADI_EDIT_REQUEST, configPermissionGroup: null,  checkAnyPermission: false}
  },
  {
    path: 'request/partial/:partial-id', component: UserRequestComponent,
    canActivate: [PermissionGuard],
    canDeactivate: [CanDeactivateGuard],
    data: {permissionKey: PermissionsEnum.SANADI_ADD_REQUEST, configPermissionGroup: null,  checkAnyPermission: false}
  },
  {
    path: 'partial-requests', component: PartialRequestComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: PermissionsEnum.SANADI_PARTIAL_REQUEST, configPermissionGroup: null,  checkAnyPermission: false}
  },
  {
    path: 'partial-request-reports', component: PartialRequestReportsComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: PermissionsEnum.SANADI_PARTIAL_REQUEST_REPORT, configPermissionGroup: null,  checkAnyPermission: false}
  },
  {
    path: 'request-search', component: UserRequestSearchComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: PermissionsEnum.SANADI_SEARCH_REQUEST, configPermissionGroup: null,  checkAnyPermission: false}
  },
  {
    path: 'requests-under-process', component: RequestsUnderProcessComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: PermissionsEnum.SANADI_UNDER_PROCESSING_REQUESTS, configPermissionGroup: null,  checkAnyPermission: false}
  },
  {
    path: 'inquiry-logs', component: InquiryLogsComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: PermissionsEnum.SANADI_INQUIRY_LOGS, configPermissionGroup: null,  checkAnyPermission: false}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SanadyRoutingModule {
}
