import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {EServicesComponent} from '@app/e-services/e-services.component';
import {InquiryContainerComponent} from '@app/e-services/pages/inquiry-container/inquiry-container.component';
import {ConsultationContainerComponent} from '@app/e-services/pages/consultation-container/consultation-container.component';
import {InternationalCooperationContainerComponent} from '@app/e-services/pages/international-cooperation-container/international-cooperation-container.component';
import {InitialExternalOfficeApprovalComponent} from "@app/e-services/pages/initial-external-office-approval/initial-external-office-approval.component";
import {FinalExternalOfficeApprovalComponent} from '@app/e-services/pages/final-external-office-approval/final-external-office-approval.component';
import {PartnerApprovalComponent} from "./pages/partner-approval/partner-approval.component";
import {PermissionGuard} from '@app/guards/permission-guard';

const routes: Routes = [
  {path: '', component: EServicesComponent},
  {
    path: 'inquiries', component: InquiryContainerComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'CREATE_CASE_INQUIRY_SERVICE', configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'consultations', component: ConsultationContainerComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'CREATE_CASE_CONSULTATION_SERVICE', configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'international-coop', component: InternationalCooperationContainerComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'CREATE_CASE_INTERNATIONAL_COOPERATION_SERVICE', configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'partner-approval', component: PartnerApprovalComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'NO_PERMISSION_1', configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'initial-external-office-approval', component: InitialExternalOfficeApprovalComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'NO_PERMISSION', configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'final-external-office-approval', component: FinalExternalOfficeApprovalComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'NO_PERMISSION_1', configPermissionGroup: null, checkAnyPermission: false}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EServicesRoutingModule {
}
