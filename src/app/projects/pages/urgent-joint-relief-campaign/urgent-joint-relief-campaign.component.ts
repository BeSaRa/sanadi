import { Component } from '@angular/core';
import { SaveTypes } from '@app/enums/save-types';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {UrgentJointReliefCampaign} from '@app/models/urgent-joint-relief-campaign';
import {UrgentJointReliefCampaignService} from '@services/urgent-joint-relief-campaign.service';
import {Observable} from 'rxjs';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {LangService} from '@services/lang.service';
import {LookupService} from '@services/lookup.service';
import {DialogService} from '@services/dialog.service';
import {ToastService} from '@services/toast.service';
import {LicenseService} from '@services/license.service';
import {EmployeeService} from '@services/employee.service';
import {DatepickerOptionsMap} from '@app/types/types';
import {DateUtils} from '@helpers/date-utils';
import {FormManager} from '@app/models/form-manager';
import {OrganizationUnitService} from '@services/organization-unit.service';
import {OrgUnit} from '@app/models/org-unit';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {Lookup} from '@app/models/lookup';
import {Country} from '@app/models/country';
import {CountryService} from '@services/country.service';
import {OrganizationOfficer} from '@app/models/organization-officer';

@Component({
  selector: 'urgent-joint-relief-campaign',
  templateUrl: './urgent-joint-relief-campaign.component.html',
  styleUrls: ['./urgent-joint-relief-campaign.component.scss']
})
export class UrgentJointReliefCampaignComponent extends EServicesGenericComponent<UrgentJointReliefCampaign, UrgentJointReliefCampaignService> {
  form!: FormGroup;
  fm!: FormManager;
  organizationUnits: OrgUnit[] = [];
  selectedOrganizationUnits: OrgUnit[] = [];
  selectedOrg!: OrgUnit;
  selectedOrganizationOfficers: OrganizationOfficer[] = [];

  datepickerOptionsMap: DatepickerOptionsMap = {
    licenseStartDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    licenseEndDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
  };

  organizationDisplayedColumns: string[] = ['arName', 'enName', 'actions'];
  commonStatusEnum = CommonStatusEnum;
  countries: Country[] = [];
  requestTypes: Lookup[] = this.lookupService.listByCategory.RequestTypeNewOnly;

  constructor(public lang: LangService,
              public fb: FormBuilder,
              public service: UrgentJointReliefCampaignService,
              private lookupService: LookupService,
              private dialog: DialogService,
              private toast: ToastService,
              private licenseService: LicenseService,
              private employeeService: EmployeeService,
              private orgUnitService: OrganizationUnitService,
              private countryService: CountryService) {
    super();
  }

  get basicInfo(): FormGroup {
    return this.form.get('basicInfo')! as FormGroup;
  }

  get specialExplanation(): FormGroup {
    return this.form.get('explanation')! as FormGroup;
  }

  get selectedOrganizations(): FormControl {
    return (this.form.get('selectedOrganizations.participatingOrganizaionList')) as FormControl;
  }

  _initComponent(): void {
    this.loadOrgUnits();
    this.loadCountries();
  }

  loadOrgUnits() {
    this.orgUnitService.loadComposite().subscribe((list) => {
      this.organizationUnits = list;
      this.selectedOrganizationUnits = this.setSelectedOrganizations();
    })
  }

  setSelectedOrganizations() {
    return this.organizationUnits
      .filter(x => this.model?.participatingOrganizaionList
        .map(xx => xx.organizationId).includes(x.id));
  }

  loadCountries() {
    this.countryService.loadComposite().subscribe((list) => {
      this.countries = list;
    })
  }

  _buildForm(): void {
    const model = new UrgentJointReliefCampaign();
    this.form = this.fb.group({
      basicInfo: this.fb.group(model.buildBasicInfo(true)),
      explanation: this.fb.group(model.buildExplanation(true))
    });

    this.fm = new FormManager(this.form, this.lang);
  }

  _afterBuildForm(): void {
  }

  _updateForm(model: UrgentJointReliefCampaign | undefined): void {
    if (!model) {
      return;
    }
    this.model = (new UrgentJointReliefCampaign()).clone({...this.model, ...model});
    this.form.patchValue({
      basicInfo: this.model?.buildBasicInfo(),
      explanation: this.model?.buildExplanation()
    });
  }

  _resetForm(): void {
  }

  _prepareModel(): Observable<UrgentJointReliefCampaign> | UrgentJointReliefCampaign {
    const model = new UrgentJointReliefCampaign().clone({
      ...this.model,
      ...this.basicInfo.getRawValue(),
      ...this.specialExplanation.getRawValue()
    });

    model.participatingOrganizaionList = this.selectedOrganizationUnits.map(x => {
      return {organizationId: x.id, arabicName: x.arName, englishName: x.enName};
    });

    model.requestType = this.requestTypes[0].lookupKey;

    return model;
  }

  _getNewInstance(): UrgentJointReliefCampaign {
    return new UrgentJointReliefCampaign();
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    return this.form.valid;
  }

  _afterSave(model: UrgentJointReliefCampaign, saveType: SaveTypes, operation: OperationTypes): void {
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
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    return this.form.valid;
  }

  _afterLaunch(): void {
    this._resetForm();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }

  _launchFail(error: any): void {
  }

  _destroyComponent(): void {
  }

  onChangeSelectedOrganization(val: number) {
    this.selectedOrg = this.organizationUnits.find(x => x.id == val)!;
  }

  addOrganization() {
    if(this.selectedOrg && !this.selectedOrganizationUnits.includes(this.selectedOrg)) {
      this.selectedOrganizationUnits = this.selectedOrganizationUnits.concat(this.selectedOrg);
    } else {
      this.dialog.error(this.lang.map.selected_item_already_exists);
    }
  }

  removeOrganization(event: MouseEvent, model: OrgUnit) {
    event.preventDefault();
    this.selectedOrganizationUnits = this.selectedOrganizationUnits.filter(x => x.id != model.id);
  }
}
