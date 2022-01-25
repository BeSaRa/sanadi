import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {EServicesComponent} from '@app/e-services/e-services.component';
import {
  ConsultationContainerComponent
} from '@app/e-services/pages/consultation-container/consultation-container.component';
import {
  InternationalCooperationContainerComponent
} from '@app/e-services/pages/international-cooperation-container/international-cooperation-container.component';
import {
  InitialExternalOfficeApprovalComponent
} from "@app/e-services/pages/initial-external-office-approval/initial-external-office-approval.component";
import {
  FinalExternalOfficeApprovalComponent
} from '@app/e-services/pages/final-external-office-approval/final-external-office-approval.component';
import {PartnerApprovalComponent} from "./pages/partner-approval/partner-approval.component";
import {PermissionGuard} from '@app/guards/permission-guard';
import {EServicePermissions} from "@app/enums/e-service-permissions";
import {
  EServiceComponentWrapperComponent
} from "@app/e-services/shared/e-service-component-wrapper/e-service-component-wrapper.component";

const routes: Routes = [
  {path: '', component: EServicesComponent},
  {
    path: 'inquiries', component: EServiceComponentWrapperComponent,
    canActivate: [PermissionGuard],
    data: {
      permissionKey: EServicePermissions.INQUIRY,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'InquiryComponent'
    }
  },
  {
    path: 'consultations', component: ConsultationContainerComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: EServicePermissions.CONSULTATION, configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'international-coop', component: InternationalCooperationContainerComponent,
    canActivate: [PermissionGuard],
    data: {
      permissionKey: EServicePermissions.INTERNATIONAL_COOPERATION,
      configPermissionGroup: null,
      checkAnyPermission: false
    }
  },
  {
    path: 'partner-approval', component: PartnerApprovalComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: EServicePermissions.PARTNER_APPROVAL, configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'initial-external-office-approval', component: InitialExternalOfficeApprovalComponent,
    canActivate: [PermissionGuard],
    data: {
      permissionKey: EServicePermissions.INITIAL_EXTERNAL_OFFICE_APPROVAL,
      configPermissionGroup: null,
      checkAnyPermission: false
    }
  },
  {
    path: 'final-external-office-approval', component: FinalExternalOfficeApprovalComponent,
    canActivate: [PermissionGuard],
    data: {
      permissionKey: EServicePermissions.FINAL_EXTERNAL_OFFICE_APPROVAL,
      configPermissionGroup: null,
      checkAnyPermission: false
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EServicesRoutingModule {
}
