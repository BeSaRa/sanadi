import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ServicesGuard } from "@app/guards/services.guard";
import { ServiceItemResolver } from "@app/resolvers/service-item.resolver";
import { EServiceComponentWrapperComponent } from "@app/shared/components/e-service-component-wrapper/e-service-component-wrapper.component";
import { RemittanceComponent } from "./remittance.component";
import {EServicePermissionsEnum} from '@app/enums/e-service-permissions-enum';

const routes: Routes = [
  { path: "", component: RemittanceComponent },
  {
    path: "customs-exemption",
    component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard.canActivate],
    resolve: { info: ServiceItemResolver },
    data: {
      permissionKey: EServicePermissionsEnum.CUSTOMS_EXEMPTION_REMITTANCE,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: "CustomsExemptionComponent",
    },
  },
  {
    path: 'financial-transfers-licensing', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard.canActivate],
    resolve: { info: ServiceItemResolver },
    data: {
      permissionKey: EServicePermissionsEnum.FINANCIAL_TRANSFERS_LICENSING,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'FinancialTransfersLicensingComponent'
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RemittancesRoutingModule {}
