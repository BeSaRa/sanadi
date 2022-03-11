import { Component } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  AbstractControl,
  FormControl,
} from "@angular/forms";
import { OperationTypes } from "@app/enums/operation-types.enum";
import { SaveTypes } from "@app/enums/save-types";
import { ServiceRequestTypes } from "@app/enums/service-request-types";
import { EServicesGenericComponent } from "@app/generics/e-services-generic-component";
import { CommonUtils } from "@app/helpers/common-utils";
import { Fundraising } from "@app/models/fundraising";
import { Lookup } from "@app/models/lookup";
import { DialogService } from "@app/services/dialog.service";
import { FundraisingService } from "@app/services/fundraising.service";
import { LangService } from "@app/services/lang.service";
import { LookupService } from "@app/services/lookup.service";
import { Observable, Subject } from "rxjs";
import { FileIconsEnum } from "@app/enums/file-extension-mime-types-icons.enum";

@Component({
  selector: "fundraising",
  templateUrl: "./fundraising.component.html",
  styleUrls: ["./fundraising.component.scss"],
})
export class FundraisingComponent extends EServicesGenericComponent<
  Fundraising,
  FundraisingService
> {
  form!: FormGroup;
  fileIconsEnum = FileIconsEnum;
  licenseSearch$: Subject<string> = new Subject<string>();

  constructor(
    public lang: LangService,
    public fb: FormBuilder,
    public service: FundraisingService,
    private lookupService: LookupService,
    private dialog: DialogService
  ) {
    super();
  }

  requestTypes: Lookup[] =
    this.lookupService.listByCategory.ServiceRequestType.slice().sort(
      (a, b) => a.lookupKey - b.lookupKey
    );

  licenseDurationTypes: Lookup[] =
    this.lookupService.listByCategory.LicenseDurationType;

  get basicInfo(): FormGroup {
    return this.form.get("basicInfo")! as FormGroup;
  }

  get specialExplanation(): FormGroup {
    return this.form.get("explanation")! as FormGroup;
  }

  get requestType(): AbstractControl {
    return this.form.get("requestType")!;
  }

  get oldLicenseFullSerialField(): FormControl {
    return this.form.get("oldLicenseFullserial") as FormControl;
  }

  isEditLicenseAllowed(): boolean {
    return true;
    // if new or draft record and request type !== new, edit is allowed
    // let isAllowed = !this.model?.id || (!!this.model?.id && this.model.canCommit());
    // return isAllowed && CommonUtils.isValidValue(this.requestType.value) && this.requestType.value !== ServiceRequestTypes.NEW;
  }

  licenseSearch(): void {
    const value =
      this.oldLicenseFullSerialField.value &&
      this.oldLicenseFullSerialField.value.trim();
    if (!value) {
      this.dialog.info(this.lang.map.need_license_number_to_search);
      return;
    }
    this.licenseSearch$.next(value);
  }

  // Todo: Add listener to licenseSearch and complete searching process

  _getNewInstance(): Fundraising {
    return new Fundraising();
  }

  _initComponent(): void {
    // throw new Error('Method not implemented.');
  }

  _buildForm(): void {
    const model = new Fundraising();
    this.form = this.fb.group({
      basicInfo: this.fb.group(model.buildBasicInfo(true)),
      explanation: this.fb.group(model.buildExplanation(true)),
    });
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
  _prepareModel(): Fundraising | Observable<Fundraising> {
    throw new Error("Method not implemented.");
  }
  _afterSave(
    model: Fundraising,
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
  _updateForm(model: Fundraising | undefined): void {
    throw new Error("Method not implemented.");
  }
  _resetForm(): void {
    throw new Error("Method not implemented.");
  }
}
