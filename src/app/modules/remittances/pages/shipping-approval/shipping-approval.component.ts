import { Component } from "@angular/core";
import { FormGroup, FormBuilder, AbstractControl } from "@angular/forms";
import { EServicesGenericComponent } from "@app/generics/e-services-generic-component";
import { ShippingApproval } from "@app/models/shipping-approval";
import { ShippingApprovalService } from "@app/services/shipping-approval.service";
import { OperationTypes } from "@app/enums/operation-types.enum";
import { SaveTypes } from "@app/enums/save-types";
import { LangService } from "@app/services/lang.service";
import { Observable, of, Subject } from "rxjs";
import { LookupService } from "@app/services/lookup.service";
import { Lookup } from "@app/models/lookup";
import { ServiceRequestTypes } from "@app/enums/service-request-types";
import { catchError, exhaustMap, filter, map, switchMap, takeUntil, tap } from "rxjs/operators";
import { ReceiverTypes } from "@app/enums/receiver-type.enum";
import {LinkedProjectTypes} from "@app/enums/linked-project-type.enum"
import { CustomValidators } from "@app/validators/custom-validators";
import { DialogService } from "@app/services/dialog.service";
import { ToastService } from "@app/services/toast.service";
import { Country } from "@app/models/country";
import { CountryService } from "@app/services/country.service";
import { AgencyService } from "@app/services/agency-service";
import { Agency } from "@app/models/agency";
import { OpenFrom } from "@app/enums/open-from.enum";
import { EmployeeService } from "@app/services/employee.service";
import { ShippingApprovalSearchCriteria } from "@app/models/shipping-approval-search-criteria";
import { FileIconsEnum } from "@app/enums/file-extension-mime-types-icons.enum";
import { CustomsExemptionRemittanceService } from "@app/services/customs-exemption-remittance.service";
import { CommonUtils } from "@app/helpers/common-utils";

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
  fileIconsEnum = FileIconsEnum;
  documentSearchByOrderNo$: Subject<string> = new Subject<string>();
  documentSearchByDocNo$: Subject<string> = new Subject<string>();
  selectedDocument?: ShippingApproval;


  constructor(
    public lang: LangService,
    public fb: FormBuilder,
    public service: ShippingApprovalService,
    private lookupService: LookupService,
    private dialog: DialogService,
    private toast: ToastService,
    private countryService: CountryService,
    private agencyService: AgencyService,
    public employeeService: EmployeeService,
    private customsExemptionRemittanceService: CustomsExemptionRemittanceService
  ) {
    super();
  }

  requestTypes: Lookup[] =
    this.lookupService.listByCategory.ServiceRequestTypeNoRenew.filter(
      (l) =>
        l.lookupKey !== ServiceRequestTypes.EXTEND &&
        l.lookupKey !== ServiceRequestTypes.UPDATE
    ).sort((a, b) => a.lookupKey - b.lookupKey);

  countriesList: Country[] = [];
  receiverTypes: Lookup[] = this.lookupService.listByCategory.ReceiverType;
  shipmentSources: Lookup[] = this.lookupService.listByCategory.ShipmentSource;
  linkedProjects: Lookup[] = this.lookupService.listByCategory.LinkedProject;
  shippingMethods: Lookup[] = this.lookupService.listByCategory.ShipmentCarrier;
  receiverNames: Agency[] = [];
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  get requestType(): AbstractControl {
    return this.form.get("requestType")!;
  }

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

  get country(): AbstractControl {
    return this.form.get("country")!;
  }

  get fullSerial(): AbstractControl {
    return this.form.get("fullSerial")!;
  }

  get exportedBookFullSerial(): AbstractControl {
    return this.form.get("exportedBookFullSerial")!;
  }

  isCancelRequestType(): boolean {
    return (
      this.requestType.value &&
      this.requestType.value === ServiceRequestTypes.CANCEL
    );
  }

  isEditRequestTypeAllowed(): boolean {
    // allow edit if new record or saved as draft
    return !this.model?.id || (!!this.model?.id && this.model.canCommit());
  }

  isEditOrderNoAndDocNoAllowed(): boolean {
    // if new or draft record and request type !== new, edit is allowed
    let isAllowed =
      !this.model?.id || (!!this.model?.id && this.model.canCommit());
    return (
      isAllowed &&
      CommonUtils.isValidValue(this.requestType.value) &&
      this.requestType.value !== ServiceRequestTypes.NEW
    );
  }
  _getNewInstance(): ShippingApproval {
    return new ShippingApproval();
  }

  _initComponent(): void {
    this.loadCountries();
    this.listenToDocumentSearchByOrderNo();
    this.listenToDocumentSearchByDocNo();
  }

  private loadCountries(): void {
    this.countryService
      .loadCountries()
      .pipe(takeUntil(this.destroy$))
      .subscribe((countries) => (this.countriesList = countries));
  }

  _buildForm(): void {
    const model = new ShippingApproval();
    this.form = this.fb.group(model.buildBasicInfo(true));
    this.projectLicense.disable();
  }

  _afterBuildForm(): void {
    this.listenToLinkedProjectChanges();
    this.listenToReceiverTypeChanges();
    this.listenToCountryChange();
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
        this.handleReceiverTypeandCountryChange();
      });
  }

  private listenToCountryChange() {
    this.country.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.handleReceiverTypeandCountryChange());
  }

  handleReceiverTypeandCountryChange() {
    if (!this.country.value) {
      return;
    }
    if (
      !this.receiverType.value ||
      this.receiverType.value === ReceiverTypes.OTHER
    ) {
      return;
    }
    this.agencyService
      .loadReceiverNames(this.receiverType.value, this.country.value)
      .subscribe((receiverNames) => {
        this.receiverNames = receiverNames;
      });
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (this.requestType.value !== ServiceRequestTypes.NEW && !this.selectedDocument) {
      this.dialog.error(this.lang.map.please_select_document_to_complete_save);
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
    return new ShippingApproval().clone({
      ...this.model,
      ...this.form.getRawValue(),
    });
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
    if (!model) {
      return;
    }
    this.model = model;
    this.form.patchValue(model?.buildBasicInfo());
    this.handleReceiverTypeandCountryChange();
  }
  _resetForm(): void {
    this.form.reset();
    this.model = this._getNewInstance();
  }

  documentSearchByOrderNo($event: Event): void {
    $event?.preventDefault();
    const value = this.fullSerial.value && this.fullSerial.value.trim();
    this.documentSearchByOrderNo$.next(value);
  }

  documentSearchByDocNo($event: Event): void {
    $event?.preventDefault();
    const value =
      this.exportedBookFullSerial.value &&
      this.exportedBookFullSerial.value.trim();
    this.documentSearchByDocNo$.next(value);
  }

  loadDocumentsByCriteria(
    criteria: Partial<ShippingApprovalSearchCriteria>
  ): Observable<ShippingApproval[]> {
    return this.service.documentSearch(criteria);
  }

  private listenToDocumentSearchByOrderNo() {
    this.documentSearchByOrderNo$
    .pipe(takeUntil(this.destroy$))
    .pipe(
      exhaustMap((fullSerial) => {
        return this.loadDocumentsByCriteria({fullSerial: fullSerial})
          .pipe(catchError(() => of([])));
      })
    )
    .pipe(
      // display message in case there is no returned license
      tap((list) => !list.length ? this.dialog.info(this.lang.map.no_result_for_your_search_criteria) : null),
      // allow only the collection if it has value
      filter((result) => !!result.length)
    )
    .pipe(exhaustMap((documents) => {
      return documents.length === 1 ? this.validateSingleDocument(documents[0]) : this.openSelectDocument(documents);
    }))
    .pipe(filter((info): info is ShippingApproval => !!info))
    .subscribe((document) => {
      this.setSelectedDocument(document, false);
    });
  }

  private listenToDocumentSearchByDocNo() {
    this.documentSearchByDocNo$
    .pipe(takeUntil(this.destroy$))
    .pipe(
      exhaustMap((exportedBookFullSerial) => {
        return this.loadDocumentsByCriteria({exportedBookFullSerial: exportedBookFullSerial})
          .pipe(catchError(() => of([])));
      })
    )
    .pipe(
      // display message in case there is no returned license
      tap((list) => !list.length ? this.dialog.info(this.lang.map.no_result_for_your_search_criteria) : null),
      // allow only the collection if it has value
      filter((result) => !!result.length)
    )
    .pipe(exhaustMap((documents) => {
      return documents.length === 1 ? this.validateSingleDocument(documents[0]) : this.openSelectDocument(documents);
    }))
    .pipe(filter((info): info is ShippingApproval => !!info))
    .subscribe((document) => {
      this.setSelectedDocument(document, false);
    });
  }

  private validateSingleDocument(document: ShippingApproval): Observable<undefined | ShippingApproval> {
    return this.customsExemptionRemittanceService.validateDocumentByRequestType<ShippingApproval>(this.model!.caseType, this.requestType.value, document.id) as Observable<undefined | ShippingApproval>
  }

  private openSelectDocument(documents: ShippingApproval[]): Observable<undefined | ShippingApproval> {
    return this.customsExemptionRemittanceService.openSelectDocumentDialog(documents, this.model?.clone({requestType: this.requestType.value || null}), true, this.service.selectDocumentDisplayColumns)
      .onAfterClose$
      .pipe(map((result: ({ selected: ShippingApproval, details: ShippingApproval } | undefined)) => result ? result.details : result))
  }

  setSelectedDocument(documentDetails: ShippingApproval | undefined,ignoreUpdateForm: boolean) {
    this.selectedDocument = documentDetails;
    if (documentDetails && !ignoreUpdateForm) {
    // update form fields if i have document
    let value: any = new ShippingApproval().clone(documentDetails);
    value.requestType = this.requestType.value;

    delete value.id;

    this._updateForm(value);
    }
  }
}