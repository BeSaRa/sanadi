import { Component } from "@angular/core";
import { FormGroup, FormBuilder, AbstractControl } from "@angular/forms";
import { EServicesGenericComponent } from "@app/generics/e-services-generic-component";
import { ShippingApproval } from "@app/models/shipping-approval";
import { ShippingApprovalService } from "@app/services/shipping-approval.service";
import { OperationTypes } from "@app/enums/operation-types.enum";
import { SaveTypes } from "@app/enums/save-types";
import { LangService } from "@app/services/lang.service";
import { Observable, of } from "rxjs";
import { LookupService } from "@app/services/lookup.service";
import { Lookup } from "@app/models/lookup";
import { ServiceRequestTypes } from "@app/enums/service-request-types";
import { filter, takeUntil, tap } from "rxjs/operators";
import { ReceiverTypes } from "@app/enums/receiver-type.enum";
import {LinkedProjectTypes} from "@app/enums/linked-project-type.enum"
import { CustomValidators } from "@app/validators/custom-validators";
import { DialogService } from "@app/services/dialog.service";
import { ToastService } from "@app/services/toast.service";

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
    private lookupService: LookupService,
    private dialog: DialogService,
    private toast: ToastService
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
  shippingMethods: Lookup[] = this.lookupService.listByCategory.ShipmentCarrier;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

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
    return of(this.form.valid)
      .pipe(tap((valid) => !valid && this.invalidFormMessage()))
      .pipe(filter((valid) => valid));
  }
  private invalidFormMessage() {
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
  }
  _beforeLaunch(): boolean | Observable<boolean> {
    return !!this.model && this.form.valid && this.model.canStart();
  }
  _afterLaunch(): void {
    this._resetForm();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }
  _prepareModel(): ShippingApproval | Observable<ShippingApproval> {
    const model = new ShippingApproval().clone({
      ...this.model,
      ...this.form.getRawValue(),
    });
    return model;
  }
  _afterSave(
    model: ShippingApproval,
    saveType: SaveTypes,
    operation: OperationTypes
  ): void {
    this.model = model;
    if (
      (operation === OperationTypes.CREATE && saveType === SaveTypes.FINAL) ||
      (operation === OperationTypes.UPDATE && saveType === SaveTypes.COMMIT)
    ) {
      this.dialog.success(
        this.lang.map.msg_request_has_been_added_successfully.change({
          serial: model.fullSerial,
        })
      );
    } else {
      this.toast.success(this.lang.map.request_has_been_saved_successfully);
    }
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
    this.form.reset();
    this.model = this._getNewInstance();
  }
}