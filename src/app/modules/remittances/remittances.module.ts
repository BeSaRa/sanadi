import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RemittancesRoutingModule } from "./remittances-routing.module";
import { ShippingApprovalComponent } from "./pages/shipping-approval/shipping-approval.component";
import { RemittanceComponent } from "./remittance.component";
import { SharedModule } from "@app/shared/shared.module";
import { ShippingApproveTaskPopUpComponent } from './popups/shipping-approve-task-pop-up/shipping-approve-task-pop-up.component';

@NgModule({
  declarations: [ShippingApprovalComponent, RemittanceComponent, ShippingApproveTaskPopUpComponent],
  imports: [CommonModule, RemittancesRoutingModule, SharedModule],
})
export class RemittancesModule {}
