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
import { Observable, of, Subject } from "rxjs";
import { FileIconsEnum } from "@app/enums/file-extension-mime-types-icons.enum";
import { delay, filter, takeUntil, tap } from "rxjs/operators";
import { CustomValidators } from "@app/validators/custom-validators";

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
  selectedLicense?: Fundraising;

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
    this.lookupService.listByCategory.ServiceRequestType.filter(
      (l) => l.lookupKey !== ServiceRequestTypes.EXTEND
    ).sort((a, b) => a.lookupKey - b.lookupKey);

  licenseDurationTypes: Lookup[] =
    this.lookupService.listByCategory.LicenseDurationType;

  get basicInfo(): FormGroup {
    return this.form.get("basicInfo")! as FormGroup;
  }

  get specialExplanation(): FormGroup {
    return this.form.get("explanation")! as FormGroup;
  }

  get requestType(): AbstractControl {
    return this.form.get("basicInfo.requestType")!;
  }

  get oldLicenseFullSerialField(): FormControl {
    return this.form.get("basicInfo.oldLicenseFullSerial") as FormControl;
  }

  isEditLicenseAllowed(): boolean {
    // if new or draft record and request type !== new, edit is allowed
    let isAllowed =
      !this.model?.id || (!!this.model?.id && this.model.canCommit());
    return (
      isAllowed &&
      CommonUtils.isValidValue(this.requestType.value) &&
      this.requestType.value !== ServiceRequestTypes.NEW
    );
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

  private invalidFormMessage() {
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
  }

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
    this.listenToRequestTypeChange();
  }

  listenToRequestTypeChange(): void {
    this.requestType?.valueChanges
      .pipe(delay(50), takeUntil(this.destroy$))
      .subscribe((requestTypeValue) => {
        // if no requestType or (requestType = new)
        // if new record or draft, reset license and its validations
        // also reset the values in model
        if (!requestTypeValue || requestTypeValue === ServiceRequestTypes.NEW) {
          if (!this.model?.id || this.model.canCommit()) {
            this.oldLicenseFullSerialField.reset();
            this.oldLicenseFullSerialField.setValidators([]);

            this.setSelectedLicense(undefined, true);

            if (this.model) {
              // this.model.licenseNumber = '';
              this.model.licenseDuration = 0;
              this.model.licenseStartDate = "";
            }
          }
        } else {
          this.oldLicenseFullSerialField.setValidators([
            CustomValidators.required,
            (control) => {
              return this.selectedLicense &&
                this.selectedLicense?.fullSerial === control.value
                ? null
                : { select_license: true };
            },
          ]);
        }
        this.oldLicenseFullSerialField.updateValueAndValidity();
      });
  }
  setSelectedLicense(
    licenseDetails: Fundraising | undefined,
    ignoreUpdateForm: boolean
  ) {
    this.selectedLicense = licenseDetails;
    // Todo: complete implementation whenever licenses starts getting fetched
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    return of(this.form.valid)
      .pipe(tap((valid) => !valid && this.invalidFormMessage()))
      .pipe(filter((valid) => valid));
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    throw new Error("Method not implemented.");
  }
  _afterLaunch(): void {
    throw new Error("Method not implemented.");
  }
  _prepareModel(): Fundraising | Observable<Fundraising> {
    const model = new Fundraising().clone({
      ...this.model,
      ...this.basicInfo.getRawValue(),
      ...this.specialExplanation.getRawValue(),
    });
    console.log("prepared model in _prepareModel()", model);
    return model;
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
    if (!model) {
      return;
    }
    this.model = model;
    this.form.patchValue({
      basicInfo: model?.buildBasicInfo(),
      explanation: model?.buildExplanation(),
    });
  }
  _resetForm(): void {
    this.form.reset();
    this.model = this._getNewInstance();
  }
}
