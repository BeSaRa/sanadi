import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ServicesGuard } from "@app/guards/services.guard";
import { ServiceItemResolver } from "@app/resolvers/service-item.resolver";
import { EServiceComponentWrapperComponent } from "@app/shared/components/e-service-component-wrapper/e-service-component-wrapper.component";
import { ShippingApprovalComponent } from "./pages/shipping-approval/shipping-approval.component";
import { RemittanceComponent } from "./remittance.component";

const routes: Routes = [
  { path: "", component: RemittanceComponent },
  {
    path: "shipping-approval",
    component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard],
    resolve: { info: ServiceItemResolver },
    data: {
      render: "ShippingApprovalComponent",
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RemittancesRoutingModule {}
