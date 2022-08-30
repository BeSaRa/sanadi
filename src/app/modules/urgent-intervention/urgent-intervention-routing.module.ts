import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UrgentInterventionComponent } from './urgent-intervention.component';
import {EServiceComponentWrapperComponent} from '@app/shared/components/e-service-component-wrapper/e-service-component-wrapper.component';
import {ServicesGuard} from '@app/guards/services.guard';
import {ServiceItemResolver} from '@app/resolvers/service-item.resolver';
import {EServicePermissions} from '@app/enums/e-service-permissions';
import {PreValidateDataGuard} from '@app/guards/pre-validate-data.guard';
import {CaseTypes} from '@app/enums/case-types.enum';
import {ICustomRouteData} from '@contracts/i-custom-route-data';

const routes: Routes = [
  { path: '', component: UrgentInterventionComponent },
  {
    path: 'urgent-intervention-license', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard],
    resolve: {info: ServiceItemResolver},
    data: {
      permissionKey: EServicePermissions.URGENT_INTERVENTION_LICENSING,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'UrgentInterventionLicenseComponent'
    }
  },
  {
    path: 'urgent-intervention-announcement', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard, PreValidateDataGuard],
    resolve: {info: ServiceItemResolver},
    runGuardsAndResolvers: 'always',
    data: {
      permissionKey: EServicePermissions.URGENT_INTERVENTION_ANNOUNCEMENT,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'UrgentInterventionAnnouncementComponent',
      caseType: CaseTypes.URGENT_INTERVENTION_ANNOUNCEMENT,
      preValidateFailMsgKey: 'msg_add_intervention_license_first'
    } as ICustomRouteData
  },
  {
    path: 'urgent-intervention-closure', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard],
    resolve: {info: ServiceItemResolver},
    data: {
      permissionKey: EServicePermissions.URGENT_INTERVENTION_CLOSURE,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'UrgentInterventionClosureComponent'
    } as ICustomRouteData
  },
  {
    path: 'urgent-intervention-financial-notification', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard],
    resolve: {info: ServiceItemResolver},
    data: {
      permissionKey: EServicePermissions.URGENT_INTERVENTION_FINANCIAL_NOTIFICATION,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'UrgentInterventionFinancialNotificationComponent'
    } as ICustomRouteData
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UrgentInterventionRoutingModule { }
