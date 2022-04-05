import { Component } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { EServicesGenericComponent } from "@app/generics/e-services-generic-component";
import { ShippingApproval } from "@app/models/shipping-approval";
import { ShippingApprovalService } from "@app/services/shipping-approval.service";
import { OperationTypes } from "@app/enums/operation-types.enum";
import { SaveTypes } from "@app/enums/save-types";
import { LangService } from "@app/services/lang.service";
import { Observable } from "rxjs";
import { LookupService } from "@app/services/lookup.service";
import { Lookup } from "@app/models/lookup";
import { ServiceRequestTypes } from "@app/enums/service-request-types";

@Component({
  selector: "shipping-approval",
  templateUrl: "./shipping-approval.component.html",
  styleUrls: ["./shipping-approval.component.scss"],
})
export class ShippingApprovalComponent extends EServicesGenericComponent<
  ShippingApproval,
  ShippingApprovalService
> {
  form!: FormGroup;

  constructor(
    public lang: LangService,
    public fb: FormBuilder,
    public service: ShippingApprovalService,
    private lookupService: LookupService
  ) {
    super();
  }

  requestTypes: Lookup[] =
    this.lookupService.listByCategory.ServiceRequestTypeNoRenew.filter(
      (l) =>
        l.lookupKey !== ServiceRequestTypes.EXTEND &&
        l.lookupKey !== ServiceRequestTypes.UPDATE
    ).sort((a, b) => a.lookupKey - b.lookupKey);

  _getNewInstance(): ShippingApproval {
    return new ShippingApproval();
  }

  _initComponent(): void {
    // throw new Error('Method not implemented.');
  }

  _buildForm(): void {
    const model = new ShippingApproval();
    this.form = this.fb.group(model.buildBasicInfo(true));
  }

  _afterBuildForm(): void {
    // Never direct implement anything here; rather create a function and call it from here
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    throw new Error("Method not implemented.");
  }
  _beforeLaunch(): boolean | Observable<boolean> {
    throw new Error("Method not implemented.");
  }
  _afterLaunch(): void {
    throw new Error("Method not implemented.");
  }
  _prepareModel(): ShippingApproval | Observable<ShippingApproval> {
    throw new Error("Method not implemented.");
  }
  _afterSave(
    model: ShippingApproval,
    saveType: SaveTypes,
    operation: OperationTypes
  ): void {
    throw new Error("Method not implemented.");
  }
  _saveFail(error: any): void {
    throw new Error("Method not implemented.");
  }
  _launchFail(error: any): void {
    throw new Error("Method not implemented.");
  }
  _destroyComponent(): void {
    // throw new Error('Method not implemented.');
  }
  _updateForm(model: ShippingApproval | undefined): void {
    throw new Error("Method not implemented.");
  }
  _resetForm(): void {
    throw new Error("Method not implemented.");
  }
}