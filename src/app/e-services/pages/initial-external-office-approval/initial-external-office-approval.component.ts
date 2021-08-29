import {Component} from '@angular/core';
import {FormGroup, FormBuilder, AbstractControl} from '@angular/forms';
import {EServicesGenericComponent} from "@app/generics/e-services-generic-component";
import {InitialExternalOfficeApproval} from "@app/models/initial-external-office-approval";
import {Observable} from 'rxjs';
import {InitialExternalOfficeApprovalService} from "@app/services/initial-external-office-approval.service";
import {LangService} from "@app/services/lang.service";
import {LookupService} from "@app/services/lookup.service";
import {Lookup} from "@app/models/lookup";
import {CountryService} from "@app/services/country.service";
import {Country} from "@app/models/country";
import {takeUntil} from "rxjs/operators";

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

  constructor(public fb: FormBuilder,
              public lang: LangService,
              private lookupService: LookupService,
              private countryService: CountryService,
              public service: InitialExternalOfficeApprovalService) {
    super();
  }

  _initComponent(): void {
    this.loadCountries();
  }

  _buildForm(): void {
    this.form = this.fb.group((new InitialExternalOfficeApproval()).buildForm(true));
    this.onRequestTypeUpdate();
  }

  _beforeSave(): boolean | Observable<boolean> {
    return true;
  }

  _prepareModel(): InitialExternalOfficeApproval | Observable<InitialExternalOfficeApproval> {
    return (new InitialExternalOfficeApproval()).clone({...this.model, ...this.form.value})
  }

  _afterSave(model: InitialExternalOfficeApproval) {
    this.model = model;
  }

  _saveFail(error: any): void {
    console.log('problem on save');
  }

  _destroyComponent(): void {
    // throw new Error('Method not implemented.');
  }

  _updateForm(model: InitialExternalOfficeApproval): void {
    this.form.patchValue(model.buildForm())
  }

  _resetForm(): void {
    this.form.reset();
  }

  // start custom implementations

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

  loadCountries(): void {
    this.countryService.loadCountries()
      .pipe(takeUntil(this.destroy$))
      .subscribe((countries) => this.countries = countries)
  }

  loadRegions(id: number): void {
    this.countryService.loadCountriesByParentId(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((regions) => this.regions = regions)
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
    if (this.requestType.value === 1 || this.requestType.invalid) {
      this.licenseNumber.reset();
      this.licenseNumber.disable();
    } else {
      this.licenseNumber.enable();
    }
  }
}
