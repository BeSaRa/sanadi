import { Component } from "@angular/core";
import { FormGroup, FormBuilder, AbstractControl } from "@angular/forms";
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
import { takeUntil } from "rxjs/operators";
import { ReceiverTypes } from "@app/enums/receiver-type.enum";
import {LinkedProjectTypes} from "@app/enums/linked-project-type.enum"
import { CustomValidators } from "@app/validators/custom-validators";

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

  countriesList: Lookup[] = this.lookupService.listByCategory.Countries;
  receiverTypes: Lookup[] = this.lookupService.listByCategory.ReceiverType;
  shipmentSources: Lookup[] = this.lookupService.listByCategory.ShipmentSource;
  linkedProjects: Lookup[] = this.lookupService.listByCategory.LinkedProject;

  get linkedProject(): AbstractControl {
    return this.form.get("linkedProject")!;
  }

  get receiverType(): AbstractControl {
    return this.form.get("receiverType")!;
  }

  get otherReceiverName(): AbstractControl {
    return this.form.get("otherReceiverName")!;
  }

  get projectLicense(): AbstractControl {
    return this.form.get("projectLicense")!;
  }

  _getNewInstance(): ShippingApproval {
    return new ShippingApproval();
  }

  _initComponent(): void {
    // throw new Error('Method not implemented.');
  }

  _buildForm(): void {
    const model = new ShippingApproval();
    this.form = this.fb.group(model.buildBasicInfo(true));
    this.projectLicense.disable();
  }

  _afterBuildForm(): void {
    this.listenToLinkedProjectChanges();
    this.listenToReceiverTypeChanges();
  }

  private listenToLinkedProjectChanges() {
    this.linkedProject?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((linkedProject: LinkedProjectTypes) => {
        if (linkedProject === LinkedProjectTypes.YES) {
          if (this.projectLicense.disabled) {
            this.projectLicense.enable();
          }
          this.projectLicense.setValidators(CustomValidators.required);
        } else {
          this.projectLicense.clearValidators();
          this.projectLicense.disable();
        }
        this.projectLicense.updateValueAndValidity();
      });
  }

  private listenToReceiverTypeChanges() {
    this.receiverType.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((receiverType: ReceiverTypes) => {
        if (receiverType === ReceiverTypes.OTHER) {
          this.otherReceiverName.setValidators(CustomValidators.required);
        } else {
          this.otherReceiverName.clearValidators();
        }
        this.otherReceiverName.updateValueAndValidity();
      });
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