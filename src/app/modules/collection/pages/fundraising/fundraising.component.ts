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
import { catchError, delay, exhaustMap, filter, switchMap, takeUntil, tap } from "rxjs/operators";
import { CustomValidators } from "@app/validators/custom-validators";
import { FundraisingSearchCriteria } from "@app/models/FundRaisingSearchCriteria";
import { LicenseService } from "@app/services/license.service";
import { ToastService } from "@app/services/toast.service";
import { OpenFrom } from "@app/enums/open-from.enum";
import { EmployeeService } from "@app/services/employee.service";

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
    private dialog: DialogService,
    private licenseService: LicenseService,
    private toast:ToastService,
    public employeeService: EmployeeService
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

  isRenewOrCancelRequestType(): boolean {
    return this.requestType.value && (this.requestType.value === ServiceRequestTypes.RENEW || this.requestType.value === ServiceRequestTypes.CANCEL);
  }

  isEditRequestTypeAllowed(): boolean {
    // allow edit if new record or saved as draft
    return !this.model?.id || (!!this.model?.id && this.model.canCommit());
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

  licenseSearch($event:Event): void {
    $event?.preventDefault();
    const value =
      this.oldLicenseFullSerialField.value &&
      this.oldLicenseFullSerialField.value.trim();
    // if (!value) {
    //   this.dialog.info(this.lang.map.need_license_number_to_search);
    //   return;
    // }
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
    this.listenToLicenseSearch();
  }

  loadLicencesByCriteria(
    criteria: Partial<FundraisingSearchCriteria>
  ): Observable<Fundraising[]> {
    return this.service.licenseSearch(criteria);
  }

  private listenToLicenseSearch() {
    this.licenseSearch$
      .pipe(
        exhaustMap((oldLicenseFullSerial) => {
          return this.loadLicencesByCriteria({
            fullSerial: oldLicenseFullSerial,
          }).pipe(catchError(() => of([])));
        })
      )
      .pipe(
        // display message in case there is no returned license
        tap((list) =>
          !list.length
            ? this.dialog.info(this.lang.map.no_result_for_your_search_criteria)
            : null
        ),
        // allow only the collection if it has value
        filter((result) => !!result.length),
        // switch to the dialog ref to use it later and catch the user response
        switchMap(
          (license) =>
            this.licenseService.openSelectLicenseDialog(
              license,
              this.model?.clone({ requestType: this.requestType.value || null })
            ).onAfterClose$
        ),
        // allow only if the user select license
        filter<{ selected: Fundraising; details: Fundraising }, any>(
          (
            selection
          ): selection is { selected: Fundraising; details: Fundraising } => {
            return !!selection;
          }
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((selection) => {
        this.setSelectedLicense(selection.details, false);
      });
  }

  _buildForm(): void {
    const model = new Fundraising();
    this.form = this.fb.group({
      basicInfo: this.fb.group(model.buildBasicInfo(true)),
      explanation: this.fb.group(model.buildExplanation(true)),
    });
  }

  _afterBuildForm(): void {
    this.handleReadonly();
  }

  handleReadonly(): void {
    // if record is new, no readonly (don't change as default is readonly = false)
    if (!this.model?.id) {
      return;
    }

    let caseStatus = this.model.getCaseStatus(),
      caseStatusEnum = this.service.caseStatusEnumMap[this.model.getCaseType()];
    if (
      caseStatusEnum &&
      (caseStatus == caseStatusEnum.FINAL_APPROVE ||
        caseStatus === caseStatusEnum.FINAL_REJECTION)
    ) {
      this.readonly = true;
      return;
    }

    if (this.openFrom === OpenFrom.USER_INBOX) {
      if (this.employeeService.isCharityManager()) {
        this.readonly = false;
      } else if (this.employeeService.isCharityUser()) {
        this.readonly = !this.model.isReturned();
      }
    } else if (this.openFrom === OpenFrom.TEAM_INBOX) {
      // after claim, consider it same as user inbox and use same condition
      if (this.model.taskDetails.isClaimed()) {
        if (this.employeeService.isCharityManager()) {
          this.readonly = false;
        } else if (this.employeeService.isCharityUser()) {
          this.readonly = !this.model.isReturned();
        }
      }
    } else if (this.openFrom === OpenFrom.SEARCH) {
      // if saved as draft, then no readonly
      if (this.model?.canCommit()) {
        this.readonly = false;
      }
    }

  }


  handleRequestTypeChange(
    requestTypeValue: number,
    userInteraction: boolean = false
  ): void {
    if (userInteraction) {
      this._resetForm();
      this.requestType.setValue(requestTypeValue);
    }
    if (!requestTypeValue) {
      requestTypeValue = this.requestType && this.requestType.value;
    }

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
  }
  setSelectedLicense(
    licenseDetails: Fundraising | undefined,
    ignoreUpdateForm: boolean
  ) {
    this.selectedLicense = licenseDetails;
    // update form fields if i have license
    if (licenseDetails && !ignoreUpdateForm) {
      let value: any = new Fundraising().clone(licenseDetails);
      value.requestType = this.requestType.value;
      value.oldLicenseFullSerial = licenseDetails.fullSerial;
      value.oldLicenseId = licenseDetails.id;
      value.oldLicenseSerial = licenseDetails.serial;
      value.documentTitle = '';
      value.fullSerial = null;
      value.description = '';

      // delete id because license details contains old license id, and we are adding new, so no id is needed
      delete value.id;
      delete value.vsId;

      this._updateForm(value);
    }
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (this.requestType.value !== ServiceRequestTypes.NEW && !this.selectedLicense) {
      this.dialog.error(this.lang.map.please_select_license_to_complete_save);
      return false;
    } else {
      if (saveType === SaveTypes.DRAFT) {
        return true;
      }
      return of(this.form.valid)
        .pipe(tap((valid) => !valid && this.invalidFormMessage()))
        .pipe(filter((valid) => valid));
    }
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    return !!this.model && this.form.valid && this.model.canStart();
  }
  _afterLaunch(): void {
    this._resetForm();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }
  _prepareModel(): Fundraising | Observable<Fundraising> {
    return new Fundraising().clone<Fundraising>({
      ...this.model,
      ...this.basicInfo.getRawValue(),
      ...this.specialExplanation.getRawValue(),
    });
  }
  _afterSave(
    model: Fundraising,
    saveType: SaveTypes,
    operation: OperationTypes
  ): void {
    this.model = model;
    if (
      (operation === OperationTypes.CREATE && saveType === SaveTypes.FINAL) ||
      (operation === OperationTypes.UPDATE && saveType === SaveTypes.COMMIT)
    ) {
      this.dialog.success(this.lang.map.msg_request_has_been_added_successfully.change({serial: model.fullSerial}));
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
  _updateForm(model: Fundraising | undefined): void {
    if (!model) {
      return;
    }
    this.model = model;
    this.form.patchValue({
      basicInfo: model?.buildBasicInfo(),
      explanation: model?.buildExplanation(),
    });
    this.handleRequestTypeChange(model.requestType, false);
  }
  _resetForm(): void {
    this.form.reset();
    this.model = this._getNewInstance();
    this.setSelectedLicense(undefined, true);
  }
}
