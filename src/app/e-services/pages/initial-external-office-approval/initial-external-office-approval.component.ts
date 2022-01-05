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
import {catchError, delay, exhaustMap, filter, map, switchMap, takeUntil, tap} from "rxjs/operators";
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
import {OpenFrom} from '@app/enums/open-from.enum';
import {CommonUtils} from '@app/helpers/common-utils';
import {WFActions} from '@app/enums/wfactions.enum';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {FileIconsEnum} from '@app/enums/file-extension-mime-types-icons.enum';

@Component({
  selector: 'initial-external-office-approval',
  templateUrl: './initial-external-office-approval.component.html',
  styleUrls: ['./initial-external-office-approval.component.scss']
})
export class InitialExternalOfficeApprovalComponent extends EServicesGenericComponent<InitialExternalOfficeApproval, InitialExternalOfficeApprovalService> {

  form!: FormGroup;
  requestTypes: Lookup[] = this.lookupService.listByCategory.ServiceRequestType.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  countries: Country[] = []
  // regions: Country[] = [];
  licenseSearch$: Subject<string> = new Subject<string>();
  selectedLicense?: InitialApprovalDocument;
  organizations: OrgUnit[] = [];
  fileIconsEnum = FileIconsEnum;

  tabsData: IKeyValue = {
    basicInfo: {
      name: 'basicInfoTab',
      langKey: 'lbl_basic_info',
      validStatus: () => this.form && this.form.valid
    },
    comments: {
      name: 'commentsTab',
      langKey: 'comments',
      validStatus: () => true
    },
    attachments: {
      name: 'attachments',
      langKey: 'attachments',
      validStatus: () => true
    },
    logs: {
      name: 'logs',
      langKey: 'logs',
      validStatus: () => true
    }
  };

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

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
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
    this.setDefaultOrganization();

    // setTimeout(() => {
      this.handleReadonly();
      if (this.fromDialog) {
        // if license number exists, load it and regions will be loaded inside
        // otherwise load regions separately
        if (this.model?.licenseNumber) {
          this.loadSelectedLicense(this.model?.licenseNumber!);
        }/* else {
          this.loadRegions(this.country.value);
        }*/
      }
      this.listenToRequestTypeChange();
    // });
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (this.requestType.value !== ServiceRequestTypes.NEW && !this.selectedLicense) {
      this.dialog.error(this.lang.map.please_select_license_to_complete_save);
      return false;
    } else {
      return true;
    }
  }

  _prepareModel(): InitialExternalOfficeApproval | Observable<InitialExternalOfficeApproval> {
    return (new InitialExternalOfficeApproval()).clone({...this.model, ...this.form.value})
  }

  private _updateModelAfterSave(model: InitialExternalOfficeApproval): void {
    if ((this.openFrom === OpenFrom.USER_INBOX || this.openFrom === OpenFrom.TEAM_INBOX) && this.model?.taskDetails && this.model.taskDetails.tkiid) {
      this.service.getTask(this.model.taskDetails.tkiid)
        .subscribe((model) => {
          this.model = model;
        })
    } else {
      this.model = model;
    }
  }

  _afterSave(model: InitialExternalOfficeApproval, saveType: SaveTypes, operation: OperationTypes) {
    this._updateModelAfterSave(model);

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
    this.form.patchValue(model.buildForm());
  }

  _resetForm(): void {
    this.form.reset();
    this.model = this._getNewInstance();
    this.operation = this.operationTypes.CREATE;
    this.setDefaultOrganization();
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    return !!this.model && this.form.valid && this.model.canStart();
  }

  _afterLaunch(): void {
    this._resetForm();
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

  /*private loadRegions(id: number): void {
    this.regions = [];
    if (!id) {
      return;
    }
    this.countryService.loadCountriesByParentId(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((regions) => this.regions = regions)
  }*/

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
    // this.loadRegions(this.country.value);
  }

  listenToRequestTypeChange(): void {
    this.requestType?.valueChanges.pipe(
      delay(50),
      takeUntil(this.destroy$)
    ).subscribe(requestTypeValue => {
      this._handleRequestTypeDependentControls();

      // if no requestType or (requestType = new)
      // if new record or draft, reset license and its validations
      // also reset the values in model
      if (!requestTypeValue || (requestTypeValue === ServiceRequestTypes.NEW)) {
        if (!this.model?.id || this.model.canCommit()) {
          this.licenseNumber.reset();
          this.licenseNumber.setValidators([]);
          this.setSelectedLicense(undefined, undefined);

          if (this.model) {
            this.model.licenseNumber = '';
            this.model.licenseDuration = 0;
            this.model.licenseStartDate = '';
          }
        }
      } else {
        this.licenseNumber.setValidators([CustomValidators.required, (control) => {
          return this.selectedLicense && this.selectedLicense?.licenseNumber === control.value ? null : {select_license: true}
        }]);
      }
      this.licenseNumber.updateValueAndValidity();
    });
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
        switchMap(license => this.licenseService.openSelectLicenseDialog(license, this.model?.clone({requestType: this.requestType.value || null})).onAfterClose$),
        // allow only if the user select license
        filter<{ selected: InitialApprovalDocument, details: InitialExternalOfficeApproval }, any>
        ((selection): selection is { selected: InitialApprovalDocument, details: InitialExternalOfficeApproval } => {
          return !!(selection);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((selection) => {
        this.setSelectedLicense(selection.selected, selection.details);
      })
  }

  private setSelectedLicense(license?: InitialApprovalDocument, licenseDetails?: InitialExternalOfficeApproval) {
    this.selectedLicense = license;
    // update form fields if i have license
    if (license && licenseDetails) {
      this._updateForm((new InitialExternalOfficeApproval()).clone({
        organizationId: license.organizationId,
        requestType: this.requestType.value,
        licenseNumber: license.licenseNumber,
        country: license.country,
        region: license.region,
        licenseDuration: license.licenseDuration,
        licenseStartDate: license.licenseStartDate
      }))
    }
    this._handleRequestTypeDependentControls();

    /*if (license) {
      this.loadRegions(this.country.value);
    }*/
  }

  licenseSearch(): void {
    const value = this.licenseNumber.value && this.licenseNumber.value.trim();
    if (!value) {
      this.dialog.info(this.lang.map.need_license_number_to_search)
      return;
    }
    this.licenseSearch$.next(value);
  }

  private _handleRequestTypeDependentControls(): void {
    /*let requestType = this.requestType.value;
    // if no request type selected, disable license, country, region
    // otherwise enable/disable license, country and region according to request type


    if (!CommonUtils.isValidValue(requestType) || this.readonly) {
      this.country.disable();
      this.region.disable();
      return;
    }

    if (requestType === ServiceRequestTypes.NEW) {
      this.licenseNumber.disable();
    } else {
      this.licenseNumber.enable();
    }

    if (requestType === ServiceRequestTypes.RENEW || requestType === ServiceRequestTypes.EXTEND || requestType === ServiceRequestTypes.CANCEL) {
      this.country.disable();
      this.region.disable();
    } else {
      this.country.enable();
      this.region.enable();
    }*/
  }

  private loadSelectedLicense(licenseNumber: string): void {
    if (!this.model || !licenseNumber) {
      return;
    }
    this.service
      .licenseSearch({licenseNumber})
      .pipe(
        filter(list => {
         /* // if license number exists, set it and regions will be loaded inside
          // otherwise load regions separately
          if (list.length === 0) {
            this.loadRegions(this.country.value);
          }*/
          return list.length > 0;
        }),
        map(list => list[0]),
        takeUntil(this.destroy$)
      )
      .subscribe((license) => {
        this.setSelectedLicense(license, undefined)
      })
  }

  viewLicense(): void {
    if (!this.selectedLicense)
      return;

    this.licenseService.openSelectLicenseDialog([this.selectedLicense], this.model, false)
  }

  handleReadonly(): void {
    // if record is new, no readonly (don't change as default is readonly = false)
    if (!this.model?.id) {
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
      // if saved as draft and opened by creator who is charity user, then no readonly
      if (this.model?.canCommit()) {
        this.readonly = false;
      }
    }
  }


  isEditRequestTypeAllowed(): boolean {
    // allow edit if new record or saved as draft
    return !this.model?.id || (!!this.model?.id && this.model.canCommit());
  }

  isEditLicenseAllowed(): boolean {
    // if new or draft record and request type !== new, edit is allowed
    let isAllowed = !this.model?.id || (!!this.model?.id && this.model.canCommit());
    return isAllowed && CommonUtils.isValidValue(this.requestType.value) && this.requestType.value !== ServiceRequestTypes.NEW;
  }

  isEditCountryAllowed(): boolean {
    let requestType = this.requestType.value,
      isAllowed = !(requestType === ServiceRequestTypes.RENEW || requestType === ServiceRequestTypes.EXTEND || requestType === ServiceRequestTypes.CANCEL);

    if (!this.model?.id || (!!this.model?.id && this.model.canCommit())) {
      return isAllowed;
    } else {
      return isAllowed && !this.readonly;
    }
  }

  isEditRequestTypeAllowed1(): boolean {
    // allow edit if new record
    if (!this.model?.id) {
      return true;
    }

    let allowEdit = false;
    if (this.openFrom === OpenFrom.ADD_SCREEN) {
      // add screen, allow edit if saved as draft
      allowEdit = this.model.canCommit();
    } else {
      let caseStatusEnum = this.service.caseStatusEnumMap[this.model?.caseType!];

      if (this.openFrom === OpenFrom.USER_INBOX) {
        // if final approved or final rejected, can't change
        // otherwise if charity manager or charity user, allow change if its returned request
        if (this.model?.caseStatus === caseStatusEnum.FINAL_APPROVE || this.model?.caseStatus === caseStatusEnum.FINAL_REJECTION) {
          allowEdit = false;
        } else if (this.employeeService.isCharityManager() || this.employeeService.isCharityUser()) {
          allowEdit = this.model.isReturned();
        }
      } else if (this.openFrom === OpenFrom.TEAM_INBOX) {
        // if not claimed, don't allow edit
        // otherwise after claim, if charity manager or charity user, allow change if its returned request
        if (this.model.taskDetails.actions.includes(WFActions.ACTION_CLAIM)) {
          allowEdit = false;
        } else if (this.employeeService.isCharityManager() || this.employeeService.isCharityUser()) {
          allowEdit = this.model.isReturned();
        }
      } else if (this.openFrom === OpenFrom.SEARCH) {
        // if saved as draft and opened by creator who is charity user, allow edit
        if (this.model?.canCommit() && this.employeeService.isCharityUser() && this.employeeService.getUser()?.id === this.model.creatorInfo?.id) {
          allowEdit = true;
        }
      }
    }
    return allowEdit;
  }

  isAttachmentReadonly(): boolean {
    if (!this.model?.id) {
      return false;
    }
    let isAllowed = true;
    if (this.openFrom === OpenFrom.TEAM_INBOX) {
      isAllowed = this.model.taskDetails.isClaimed();
    }
    if (isAllowed) {
      let caseStatus = this.model.getCaseStatus(),
        caseStatusEnum = this.service.caseStatusEnumMap[this.model.getCaseType()];

      if (caseStatusEnum) {
        isAllowed = (caseStatus !== caseStatusEnum.CANCELLED && caseStatus !== caseStatusEnum.FINAL_APPROVE && caseStatus !== caseStatusEnum.FINAL_REJECTION);
      }
    }

    return !isAllowed;
  }

  isAddCommentAllowed(): boolean {
    if (!this.model?.id || this.employeeService.isExternalUser()) {
      return false;
    }
    let isAllowed = true;
    if (this.openFrom === OpenFrom.TEAM_INBOX) {
      isAllowed = this.model.taskDetails.isClaimed();
    }
    return isAllowed;
  }
}
