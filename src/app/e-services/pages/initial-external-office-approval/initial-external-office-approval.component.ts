import {Component} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup} from '@angular/forms';
import {EServicesGenericComponent} from "@app/generics/e-services-generic-component";
import {InitialExternalOfficeApproval} from "@app/models/initial-external-office-approval";
import {Observable, of, Subject} from 'rxjs';
import {InitialExternalOfficeApprovalService} from "@app/services/initial-external-office-approval.service";
import {LangService} from "@app/services/lang.service";
import {LookupService} from "@app/services/lookup.service";
import {Lookup} from "@app/models/lookup";
import {CountryService} from "@app/services/country.service";
import {Country} from "@app/models/country";
import {catchError, exhaustMap, filter, map, switchMap, takeUntil, tap} from "rxjs/operators";
import {InitialApprovalDocument} from "@app/models/initial-approval-document";
import {LicenseService} from "@app/services/license.service";
import {DialogService} from "@app/services/dialog.service";
import {CustomValidators} from "@app/validators/custom-validators";
import {OrgUnit} from "@app/models/org-unit";
import {OrganizationUnitService} from "@app/services/organization-unit.service";
import {EmployeeService} from "@app/services/employee.service";
import {SaveTypes} from "@app/enums/save-types";
import {OperationTypes} from "@app/enums/operation-types.enum";
import {ToastService} from "@app/services/toast.service";
import {ServiceRequestTypes} from "@app/enums/service-request-types";

@Component({
  selector: 'initial-external-office-approval',
  templateUrl: './initial-external-office-approval.component.html',
  styleUrls: ['./initial-external-office-approval.component.scss']
})
export class InitialExternalOfficeApprovalComponent extends EServicesGenericComponent<InitialExternalOfficeApproval, InitialExternalOfficeApprovalService> {

  form!: FormGroup;
  requestTypes: Lookup[] = this.lookupService.listByCategory.ServiceRequestType.sort((a, b) => a.lookupKey - b.lookupKey);
  countries: Country[] = []
  regions: Country[] = [];
  licenseSearch$: Subject<string> = new Subject<string>();
  selectedLicense?: InitialApprovalDocument;
  organizations: OrgUnit[] = [];

  constructor(public fb: FormBuilder,
              public lang: LangService,
              private lookupService: LookupService,
              private countryService: CountryService,
              private orgService: OrganizationUnitService,
              private licenseService: LicenseService,
              private dialog: DialogService,
              public employeeService: EmployeeService,
              private toast: ToastService,
              public service: InitialExternalOfficeApprovalService) {
    super();

  }

  _getNewInstance(): InitialExternalOfficeApproval {
    return new InitialExternalOfficeApproval();
  }

  _initComponent(): void {
    this.loadCountries();
    this.loadOrganizations();
    this.listenToLicenseSearch();
  }

  _buildForm(): void {
    this.form = this.fb.group((new InitialExternalOfficeApproval()).buildForm(true));
  }

  _afterBuildForm(): void {
    this.onRequestTypeUpdate();
    this.setDefaultOrganization();

    if (this.fromDialog && this.requestType.value !== ServiceRequestTypes.NEW) {
      this.loadSelectedLicense(this.model?.licenseNumber!);
    }
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (saveType !== SaveTypes.DRAFT && this.requestType.value !== ServiceRequestTypes.NEW && !this.selectedLicense) {
      this.dialog.error(this.lang.map.please_select_license_to_complete_save);
      return false;
    } else {
      return true;
    }
  }

  _prepareModel(): InitialExternalOfficeApproval | Observable<InitialExternalOfficeApproval> {
    return (new InitialExternalOfficeApproval()).clone({...this.model, ...this.form.value})
  }

  _afterSave(model: InitialExternalOfficeApproval, saveType: SaveTypes, operation: OperationTypes) {
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
    console.log('problem on save');
  }

  _destroyComponent(): void {
    // throw new Error('Method not implemented.');
  }

  _updateForm(model: InitialExternalOfficeApproval): void {
    this.model = model;
    this.form.patchValue(model.buildForm())
  }

  _resetForm(): void {
    this.form.reset();
    this.setDefaultOrganization();
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    return !!this.model && this.form.valid && this.model.canStart();
  }

  _afterLaunch(): void {
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }

  _launchFail(error: any): void {
    console.log(error);
  }


  // start custom implementations
  get organizationId(): AbstractControl {
    return this.form.get('organizationId')!;
  }

  get country(): AbstractControl {
    return this.form.get('country')!;
  }

  get region(): AbstractControl {
    return this.form.get('region')!;
  }

  get requestType(): AbstractControl {
    return this.form.get('requestType')!
  }

  get licenseNumber(): AbstractControl {
    return this.form.get('licenseNumber')!
  }

  private loadCountries(): void {
    this.countryService.loadCountries()
      .pipe(takeUntil(this.destroy$))
      .subscribe((countries) => this.countries = countries)
  }

  private loadRegions(id: number): void {
    this.countryService.loadCountriesByParentId(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((regions) => this.regions = regions)
  }

  private loadOrganizations() {
    this.orgService.load()
      .pipe(takeUntil(this.destroy$))
      .subscribe((organizations) => {
        this.organizations = organizations;
        this.setDefaultOrganization();
      })
  }

  private setDefaultOrganization(): void {
    if (this.operation === this.operationTypes.CREATE && this.employeeService.isExternalUser()) {
      const orgId = this.employeeService.getOrgUnit()?.id;
      this.organizationId.patchValue(orgId);
      this.organizationId.disable();
    }
  }

  onCountrySelected(): void {
    this.region.reset();
    if (this.country.invalid) {
      return;
    }
    this.loadRegions(this.country.value);
  }

  onRequestTypeUpdate() {
    // clear/disable the license number field if the request type is new
    if (this.requestType.value === ServiceRequestTypes.NEW || this.requestType.invalid) {
      this.licenseNumber.reset();
      this.licenseNumber.disable();
      this.licenseNumber.setValidators([]);
      this.setSelectedLicense(undefined);
    } else {
      this.licenseNumber.enable();
      this.licenseNumber.setValidators([CustomValidators.required, (control) => {
        return this.selectedLicense && this.selectedLicense?.licenseNumber === control.value ? null : {select_license: true}
      }]);
    }
    this.licenseNumber.updateValueAndValidity({emitEvent: false})
  }

  private listenToLicenseSearch() {
    this.licenseSearch$
      .pipe(exhaustMap(value => {
        return this.service
          .licenseSearch({licenseNumber: value})
          .pipe(catchError(() => of([])))
      }))
      .pipe(
        // display message in case there is no returned license
        tap(list => !list.length ? this.dialog.info(this.lang.map.no_result_for_your_search_criteria) : null),
        // allow only the collection if it has value
        filter(result => !!result.length),
        // switch to the dialog ref to use it later and catch the user response
        switchMap(license => this.licenseService.openSelectLicenseDialog(license, this.model?.caseType).onAfterClose$),
        // allow only if the user select license
        filter<null | InitialApprovalDocument, InitialApprovalDocument>
        ((selection): selection is InitialApprovalDocument => selection instanceof InitialApprovalDocument),
        takeUntil(this.destroy$)
      )
      .subscribe((license) => {
        this.setSelectedLicense(license);
      })
  }

  private setSelectedLicense(license?: InitialApprovalDocument, ignoreFormUpdate = false) {
    this.selectedLicense = license;
    // update form fields if i have license
    if (license && !ignoreFormUpdate) {
      this._updateForm((new InitialExternalOfficeApproval()).clone({
        organizationId: license.organizationId,
        requestType: this.requestType.value,
        licenseNumber: license.licenseNumber,
        country: license.country,
        region: license.region,
      }))
    }

    if (license) {
      this.loadRegions(license.country);
    }
  }

  licenseSearch(): void {
    const value = this.licenseNumber.value && this.licenseNumber.value.trim();
    if (!value) {
      this.dialog.info(this.lang.map.need_license_number_to_search)
      return;
    }
    this.licenseSearch$.next(value);
  }

  private loadSelectedLicense(licenseNumber: string): void {
    this.service
      .licenseSearch({licenseNumber})
      .pipe(
        filter(list => !!list.length),
        map(list => list[0]),
        takeUntil(this.destroy$)
      )
      .subscribe((license) => {
        this.setSelectedLicense(license, true)
      })
  }

  viewLicense(): void {
    if (!this.selectedLicense)
      return;

    this.licenseService.openSelectLicenseDialog([this.selectedLicense], this.model?.caseType, false)
  }
}
