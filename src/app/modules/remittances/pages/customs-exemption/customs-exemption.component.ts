import {Component} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup} from '@angular/forms';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {CustomsExemptionRemittance} from '@app/models/customs-exemption-remittance';
import {CustomsExemptionRemittanceService} from '@services/customs-exemption-remittance.service';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {SaveTypes} from '@app/enums/save-types';
import {LangService} from '@app/services/lang.service';
import {Observable, of, Subject} from 'rxjs';
import {LookupService} from '@app/services/lookup.service';
import {Lookup} from '@app/models/lookup';
import {ServiceRequestTypes} from '@app/enums/service-request-types';
import {catchError, distinctUntilChanged, exhaustMap, filter, map, takeUntil, tap} from 'rxjs/operators';
import {ReceiverTypes} from '@app/enums/receiver-type.enum';
import {LinkedProjectTypes} from '@app/enums/linked-project-type.enum';
import {CustomValidators} from '@app/validators/custom-validators';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {Country} from '@app/models/country';
import {CountryService} from '@app/services/country.service';
import {OpenFrom} from '@app/enums/open-from.enum';
import {EmployeeService} from '@app/services/employee.service';
import {CustomsExemptionSearchCriteria} from '@app/models/customs-exemption-search-criteria';
import {FileIconsEnum} from '@app/enums/file-extension-mime-types-icons.enum';
import {CommonUtils} from '@app/helpers/common-utils';
import {CommonCaseStatus} from '@app/enums/common-case-status.enum';
import {AdminResult} from '@app/models/admin-result';

@Component({
  selector: 'customs-exemption',
  templateUrl: './customs-exemption.component.html',
  styleUrls: ['./customs-exemption.component.scss'],
})
export class CustomsExemptionComponent extends EServicesGenericComponent<CustomsExemptionRemittance, CustomsExemptionRemittanceService> {
  form!: FormGroup;
  fileIconsEnum = FileIconsEnum;
  documentSearchByOrderNo$: Subject<string> = new Subject<string>();
  documentSearchByDocNo$: Subject<string> = new Subject<string>();
  selectedDocument?: CustomsExemptionRemittance;
  displayProjectLicenseSearchButton = false;

  constructor(public lang: LangService,
              public fb: FormBuilder,
              public service: CustomsExemptionRemittanceService,
              private lookupService: LookupService,
              private dialog: DialogService,
              private toast: ToastService,
              private countryService: CountryService,
              public employeeService: EmployeeService) {
    super();
  }

  requestTypes: Lookup[] = this.lookupService.listByCategory.CustomsExemptionRequestType.sort((a, b) => a.lookupKey - b.lookupKey);

  countriesList: Country[] = [];
  receiverTypes: Lookup[] = this.lookupService.listByCategory.ReceiverType;
  shipmentSources: Lookup[] = this.lookupService.listByCategory.ShipmentSource;
  linkedProjects: Lookup[] = this.lookupService.listByCategory.LinkedProject;
  shippingMethods: Lookup[] = this.lookupService.listByCategory.ShipmentCarrier;
  receiverNamesList: AdminResult[] = [];

  get requestType(): AbstractControl {
    return this.form.get('requestType')!;
  }

  get linkedProject(): AbstractControl {
    return this.form.get('linkedProject')!;
  }

  get receiverTypeField(): AbstractControl {
    return this.form.get('receiverType')!;
  }

  get receiverNameField(): AbstractControl {
    return this.form.get('receiverName')!;
  }

  get otherReceiverName(): AbstractControl {
    return this.form.get('otherReceiverName')!;
  }

  get projectLicense(): AbstractControl {
    return this.form.get('projectLicense')!;
  }

  get country(): AbstractControl {
    return this.form.get('country')!;
  }

  get fullSerial(): AbstractControl {
    return this.form.get('fullSerial')!;
  }

  get exportedBookFullSerial(): AbstractControl {
    return this.form.get('exportedBookFullSerial')!;
  }

  isCancelRequestType(): boolean {
    return (this.requestType.value && this.requestType.value === ServiceRequestTypes.CANCEL);
  }

  isEditRequestTypeAllowed(): boolean {
    // allow edit if new record or saved as draft
    return !this.model?.id || (!!this.model?.id && this.model.canCommit());
  }

  isEditOrderNoAndDocNoAllowed(): boolean {
    // if new or draft record and request type !== new, edit is allowed
    let isAllowed = !this.model?.id || (!!this.model?.id && this.model.canCommit());
    return (isAllowed && CommonUtils.isValidValue(this.requestType.value) && this.requestType.value !== ServiceRequestTypes.NEW);
  }

  _getNewInstance(): CustomsExemptionRemittance {
    return new CustomsExemptionRemittance();
  }

  _initComponent(): void {
    this.loadCountries();
    this.listenToDocumentSearchByOrderNo();
    this.listenToDocumentSearchByDocNo();
  }

  private loadCountries(): void {
    this.countryService.loadCountries()
      .pipe(takeUntil(this.destroy$))
      .subscribe((countries) => (this.countriesList = countries));
  }

  _buildForm(): void {
    const model = new CustomsExemptionRemittance();
    this.form = this.fb.group(model.buildBasicInfo(true));
    this.projectLicense.disable();
  }

  _afterBuildForm(): void {
    this.listenToLinkedProjectChanges();
    this.listenToOrderNoChange();
    this.listenToDocNoChange();
    this.handleReadonly();
  }

  listenToOrderNoChange() {
    this.fullSerial.valueChanges
      .pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe(() => {
        if (!this.fullSerial.value && !this.exportedBookFullSerial.value) {
          this.fullSerial.setValidators([CustomValidators.required, (control) => {
            return this.selectedDocument && this.selectedDocument?.fullSerial === control.value ? null : {select_document: true};
          }]);
          this.exportedBookFullSerial.setValidators([CustomValidators.required, (control) => {
            return this.selectedDocument && this.selectedDocument?.exportedBookFullSerial === control.value ? null : {select_document: true};
          }]);

          this.fullSerial.updateValueAndValidity();
          this.exportedBookFullSerial.updateValueAndValidity();
        } else if (this.fullSerial.value) {
          this.exportedBookFullSerial.clearValidators();
          this.exportedBookFullSerial.updateValueAndValidity();
          this.fullSerial.setValidators([CustomValidators.required, (control) => {
            return this.selectedDocument && this.selectedDocument?.fullSerial === control.value ? null : {select_document: true};
          }]);
          this.fullSerial.updateValueAndValidity();
        }
      });
  }

  listenToDocNoChange() {
    this.exportedBookFullSerial.valueChanges
      .pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe(() => {
        if (!this.fullSerial.value && !this.exportedBookFullSerial.value) {
          this.fullSerial.setValidators([CustomValidators.required, (control) => {
            return this.selectedDocument && this.selectedDocument?.fullSerial === control.value ? null : {select_document: true};
          }]);
          this.exportedBookFullSerial.setValidators([CustomValidators.required, (control) => {
            return this.selectedDocument && this.selectedDocument?.exportedBookFullSerial === control.value ? null : {select_document: true};
          }]);

          this.fullSerial.updateValueAndValidity();
          this.exportedBookFullSerial.updateValueAndValidity();
        } else if (this.exportedBookFullSerial.value) {
          this.fullSerial.clearValidators();
          this.fullSerial.updateValueAndValidity();
          this.exportedBookFullSerial.setValidators([CustomValidators.required, (control) => {
            return this.selectedDocument && this.selectedDocument?.exportedBookFullSerial === control.value ? null : {select_document: true};
          }]);
          this.exportedBookFullSerial.updateValueAndValidity();
        }
      });
  }

  handleReadonly(): void {
    // if record is new, no readonly (don't change as default is readonly = false)
    if (!this.model?.id) {
      return;
    }

    let caseStatus = this.model.getCaseStatus();
    if (caseStatus == CommonCaseStatus.FINAL_APPROVE || caseStatus === CommonCaseStatus.FINAL_REJECTION) {
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
          this.displayProjectLicenseSearchButton = true;
        } else {
          this.projectLicense.clearValidators();
          this.projectLicense.disable();
          this.displayProjectLicenseSearchButton = false;
        }
        this.projectLicense.updateValueAndValidity();
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

  _prepareModel(): CustomsExemptionRemittance | Observable<CustomsExemptionRemittance> {
    return new CustomsExemptionRemittance().clone({
      ...this.model,
      ...this.form.getRawValue(),
    });
  }

  _afterSave(model: CustomsExemptionRemittance, saveType: SaveTypes, operation: OperationTypes): void {
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
    console.log('problem in save');
  }

  _launchFail(error: any): void {
    console.log(error);
  }

  _destroyComponent(): void {
    // throw new Error('Method not implemented.');
  }

  _updateForm(model: CustomsExemptionRemittance | undefined): void {
    if (!model) {
      return;
    }
    this.model = model;
    this.form.patchValue(model?.buildBasicInfo());
    this.handleRequestTypeChange(model.requestType, false);
    this.handleReceiverTypeChange(model.receiverType, false);
  }

  _resetForm(): void {
    this.form.reset();
    this.model = this._getNewInstance();
    this.setSelectedDocument(undefined, true);
    this.exportedBookFullSerial.clearValidators();
    this.exportedBookFullSerial.updateValueAndValidity();
    this.fullSerial.clearValidators();
    this.fullSerial.updateValueAndValidity();
    this.receiverNamesList = [];
  }

  documentSearchByOrderNo($event: Event): void {
    $event?.preventDefault();
    const value = this.fullSerial.value && this.fullSerial.value.trim();
    this.documentSearchByOrderNo$.next(value);
  }

  documentSearchByDocNo($event: Event): void {
    $event?.preventDefault();
    const value = this.exportedBookFullSerial.value && this.exportedBookFullSerial.value.trim();
    this.documentSearchByDocNo$.next(value);
  }

  loadDocumentsByCriteria(criteria: Partial<CustomsExemptionSearchCriteria>): Observable<CustomsExemptionRemittance[]> {
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
        // display message in case there is no returned document
        tap((list) => !list.length ? this.dialog.info(this.lang.map.no_result_for_your_search_criteria) : null),
        // allow only the collection if it has value
        filter((result) => !!result.length)
      )
      .pipe(
        exhaustMap((documents) => {
          return documents.length === 1 ? this.validateSingleDocument(documents[0]) : this.openSelectDocument(documents);
        })
      )
      .pipe(filter((info): info is CustomsExemptionRemittance => !!info))
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
        // display message in case there is no returned document
        tap((list) => !list.length ? this.dialog.info(this.lang.map.no_result_for_your_search_criteria) : null),
        // allow only the collection if it has value
        filter((result) => !!result.length)
      )
      .pipe(
        exhaustMap((documents) => {
          return documents.length === 1 ? this.validateSingleDocument(documents[0]) : this.openSelectDocument(documents);
        })
      )
      .pipe(filter((info): info is CustomsExemptionRemittance => !!info))
      .subscribe((document) => {
        this.setSelectedDocument(document, false);
      });
  }

  private validateSingleDocument(document: CustomsExemptionRemittance): Observable<undefined | CustomsExemptionRemittance> {
    return this.service
      .validateDocumentByRequestType<CustomsExemptionRemittance>(this.model!.caseType, this.requestType.value, document.exportedBookId) as Observable<undefined | CustomsExemptionRemittance>;
  }

  private openSelectDocument(documents: CustomsExemptionRemittance[]): Observable<undefined | CustomsExemptionRemittance> {
    return this.service
      .openSelectDocumentDialog<CustomsExemptionRemittance>(documents, this.model?.clone({requestType: this.requestType.value || null}), true, this.service.selectDocumentDisplayColumns)
      .onAfterClose$.pipe(
        map((result: ({ selected: CustomsExemptionRemittance; details: CustomsExemptionRemittance } | undefined)) => (result ? result.details : result))
      );
  }

  setSelectedDocument(documentDetails: CustomsExemptionRemittance | undefined, ignoreUpdateForm: boolean) {
    this.selectedDocument = documentDetails;
    if (documentDetails && !ignoreUpdateForm) {
      // update form fields if i have document
      let value: any = new CustomsExemptionRemittance().clone(documentDetails);
      value.requestType = this.requestType.value;
      value.documentTitle = '';

      delete value.id;

      this._updateForm(value);
    }
  }

  handleRequestTypeChange(requestTypeValue: number, userInteraction: boolean = false): void {
    if (userInteraction) {
      this._resetForm();
      this.requestType.setValue(requestTypeValue);
    }
    if (!requestTypeValue) {
      requestTypeValue = this.requestType && this.requestType.value;
    }

    // if no requestType or (requestType = new)
    // if new record or draft, reset order no and document no and its validations
    if (!requestTypeValue || requestTypeValue === ServiceRequestTypes.NEW) {
      if (!this.model?.id || this.model.canCommit()) {
        this.fullSerial.reset();
        this.fullSerial.setValidators([]);
        this.exportedBookFullSerial.reset();
        this.exportedBookFullSerial.setValidators([]);
        this.setSelectedDocument(undefined, true);
      }
    } else {
      this.fullSerial.setValidators([CustomValidators.required, (control) => {
        return this.selectedDocument && this.selectedDocument?.fullSerial === control.value ? null : {select_document: true};
      }]);
      this.exportedBookFullSerial.setValidators([CustomValidators.required, (control) => {
        return this.selectedDocument && this.selectedDocument?.exportedBookFullSerial === control.value ? null : {select_document: true};
      }]);
    }
    this.fullSerial.updateValueAndValidity();
    this.exportedBookFullSerial.updateValueAndValidity();
  }

  handleCountryChange(value: number, userInteraction: boolean = false): void {
    if (userInteraction) {
      this.receiverNameField.reset();
    }
    this.loadReceiversByCountryAndReceiverType(value, this.receiverTypeField.value);
  }

  handleReceiverTypeChange(value: number, userInteraction: boolean = false): void {
    if (userInteraction) {
      this.receiverNameField.reset();
    }
    if (value === ReceiverTypes.OTHER) {
      this.receiverNameField.removeValidators(CustomValidators.required);
      this.otherReceiverName.addValidators(CustomValidators.required);
    } else {
      this.receiverNameField.addValidators(CustomValidators.required);
      this.otherReceiverName.removeValidators(CustomValidators.required);
    }
    this.receiverNameField.updateValueAndValidity();
    this.otherReceiverName.updateValueAndValidity();

    this.loadReceiversByCountryAndReceiverType(this.country.value, value);
  }

  private loadReceiversByCountryAndReceiverType(country: number, receiverType: number) {
    if (!country || !receiverType || receiverType === ReceiverTypes.OTHER) {
      this.receiverNamesList = [];
      return;
    }
    this.service.loadReceiverNames(receiverType, country)
      .subscribe((receiverNames) => {
        this.receiverNamesList = receiverNames;
      });
  }
}
