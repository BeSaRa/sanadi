import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { EServicePermissionsEnum } from "@app/enums/e-service-permissions-enum";
import { NewServicePermissionGuard } from "@app/guards/new-service-permission.guard";
import { ServiceItemResolver } from "@app/resolvers/service-item.resolver";
import { EServiceComponentWrapperComponent } from "@app/shared/components/e-service-component-wrapper/e-service-component-wrapper.component";
import { ErrorPageComponent } from "@app/shared/components/error-page/error-page.component";
import { PenaltyViolationLogsComponent } from "./penalty-violation-logs/penalty-violation-logs.component";

const routes: Routes = [
    {
      path: 'service', component: EServiceComponentWrapperComponent,
      canActivate: [NewServicePermissionGuard.canActivate],
      resolve: {info: ServiceItemResolver.resolve},
      data: {
        permissionKey: EServicePermissionsEnum.PENALTIES_AND_VIOLATIONS,
        permissionGroup: null,
        checkAnyPermission: false,
        render: 'PenaltiesAndViolationsComponent'
      }
    },
    {
      path: 'logs', component: PenaltyViolationLogsComponent,
      canActivate: [NewServicePermissionGuard.canActivate],
      resolve: {info: ServiceItemResolver.resolve},
      data: {
        permissionKey: EServicePermissionsEnum.PENALTIES_AND_VIOLATIONS,
        permissionGroup: null,
        checkAnyPermission: false,
      }
    },
    
    {path: '', redirectTo: 'service', pathMatch: 'full'},
    {path: '**', component: ErrorPageComponent}
  ];
  
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class PenaltiesAndViolationsRoutingModule {
  }