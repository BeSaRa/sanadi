import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RemittancesRoutingModule } from "./remittances-routing.module";
import { ShippingApprovalComponent } from "./pages/shipping-approval/shipping-approval.component";
import { RemittanceComponent } from "./remittance.component";
import { SharedModule } from "@app/shared/shared.module";

@NgModule({
  declarations: [ShippingApprovalComponent, RemittanceComponent],
  imports: [CommonModule, RemittancesRoutingModule, SharedModule],
})
export class RemittancesModule {}
