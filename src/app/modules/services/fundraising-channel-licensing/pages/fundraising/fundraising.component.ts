import {Component} from '@angular/core';
import {AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {OperationTypes} from '@enums/operation-types.enum';
import {SaveTypes} from '@enums/save-types';
import {CollectionRequestType} from '@enums/service-request-types';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {CommonUtils} from '@helpers/common-utils';
import {Fundraising} from '@models/fundraising';
import {Lookup} from '@models/lookup';
import {DialogService} from '@services/dialog.service';
import {FundraisingService} from '@services/fundraising.service';
import {LangService} from '@services/lang.service';
import {LookupService} from '@services/lookup.service';
import {Observable, of, Subject} from 'rxjs';
import {FileIconsEnum} from '@enums/file-extension-mime-types-icons.enum';
import {catchError, exhaustMap, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {CustomValidators} from '@app/validators/custom-validators';
import {FundraisingSearchCriteria} from '@models/FundRaisingSearchCriteria';
import {LicenseService} from '@services/license.service';
import {ToastService} from '@services/toast.service';
import {OpenFrom} from '@enums/open-from.enum';
import {EmployeeService} from '@services/employee.service';
import {CommonCaseStatus} from '@enums/common-case-status.enum';
import {UserClickOn} from '@enums/user-click-on.enum';

@Component({
  selector: 'fundraising',
  templateUrl: './fundraising.component.html',
  styleUrls: ['./fundraising.component.scss'],
})
export class FundraisingComponent extends EServicesGenericComponent<Fundraising, FundraisingService> {
  form!: UntypedFormGroup;
  fileIconsEnum = FileIconsEnum;
  licenseSearch$: Subject<string> = new Subject<string>();
  selectedLicense?: Fundraising;

  constructor(
    public lang: LangService,
    public fb: UntypedFormBuilder,
    public service: FundraisingService,
    private lookupService: LookupService,
    private dialog: DialogService,
    private licenseService: LicenseService,
    private toast: ToastService,
    public employeeService: EmployeeService
  ) {
    super();
  }

  requestTypes: Lookup[] = this.lookupService.listByCategory.CollectionRequestType
    .sort((a, b) => a.lookupKey - b.lookupKey);

  licenseDurationTypes: Lookup[] =
    this.lookupService.listByCategory.LicenseDurationType;

  formProperties = {
    requestType: () => {
      return this.getObservableField('requestType', 'requestType');
    }
  }

  get basicInfo(): UntypedFormGroup {
    return this.form.get('basicInfo')! as UntypedFormGroup;
  }

  get specialExplanation(): UntypedFormGroup {
    return this.form.get('explanation')! as UntypedFormGroup;
  }

  get requestType(): AbstractControl {
    return this.form.get('basicInfo.requestType')!;
  }

  get licenseDurationTypeField(): AbstractControl {
    return this.form.get('basicInfo.licenseDurationType')!;
  }

  get oldLicenseFullSerialField(): UntypedFormControl {
    return this.form.get('basicInfo.oldLicenseFullSerial') as UntypedFormControl;
  }

  isCancelRequestType(): boolean {
    return this.requestType.value && (this.requestType.value === CollectionRequestType.CANCEL);
  }

  isEditRequestTypeAllowed(): boolean {
    // allow edit if new record or saved as draft
    return !this.model?.id || (!!this.model?.id && this.model.canCommit());
  }

  isEditLicenseAllowed(): boolean {
    // if new or draft record and request type !== new, edit is allowed
    let isAllowed = !this.model?.id || (!!this.model?.id && this.model.canCommit());
    return (isAllowed && CommonUtils.isValidValue(this.requestType.value) && this.requestType.value !== CollectionRequestType.NEW);
  }

  licenseSearch($event: Event): void {
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
      .pipe(takeUntil(this.destroy$))
      .pipe(
        exhaustMap((oldLicenseFullSerial) => {
          return this.loadLicencesByCriteria({
            fullSerial: oldLicenseFullSerial,
            licenseDurationType: this.licenseDurationTypeField.value
          })
            .pipe(catchError(() => of([])));
        })
      )
      .pipe(
        // display message in case there is no returned license
        tap((list) => !list.length ? this.dialog.info(this.lang.map.no_result_for_your_search_criteria) : null),
        // allow only the collection if it has value
        filter((result) => !!result.length)
      )
      .pipe(exhaustMap((licenses) => {
        return licenses.length === 1 ? this.validateSingleLicense(licenses[0]) : this.openSelectLicense(licenses);
      }))
      .pipe(filter((info): info is Fundraising => !!info))
      .subscribe((license) => {
        this.setSelectedLicense(license, false);
      });
  }

  private validateSingleLicense(license: Fundraising): Observable<undefined | Fundraising> {
    return this.licenseService.validateLicenseByRequestType<Fundraising>(this.model!.caseType, this.requestType.value, license.id) as Observable<undefined | Fundraising>;
  }

  private openSelectLicense(licenses: Fundraising[]): Observable<undefined | Fundraising> {
    return this.licenseService.openSelectLicenseDialog(licenses, this.model?.clone({requestType: this.requestType.value || null}), true, this.service.selectLicenseDisplayColumns)
      .onAfterClose$
      .pipe(map((result: ({ selected: Fundraising, details: Fundraising } | undefined)) => result ? result.details : result));
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
    if (this.fromDialog) {
      this.loadSelectedLicenseById(this.model!.oldLicenseId, () => {
        this.oldLicenseFullSerialField.updateValueAndValidity();
      });
    }
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

  handleRequestTypeChange(requestTypeValue: number, userInteraction: boolean = false): void {
    of(userInteraction).pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.confirmChangeRequestType(userInteraction))
    ).subscribe((clickOn: UserClickOn) => {
      if (clickOn === UserClickOn.YES) {
        if (userInteraction) {
          this.resetForm$.next();
          this.requestType.setValue(requestTypeValue);
        }
        this.requestType$.next(requestTypeValue);

        // if no requestType or (requestType = new)
        // if new record or draft, reset license and its validations
        // also reset the values in model
        if (!requestTypeValue || requestTypeValue === CollectionRequestType.NEW) {
          if (!this.model?.id || this.model.canCommit()) {
            this.oldLicenseFullSerialField.reset();
            this.oldLicenseFullSerialField.setValidators([]);
            this.setSelectedLicense(undefined, true);

            if (this.model) {
              // this.model.licenseNumber = '';
              this.model.licenseDuration = 0;
              this.model.licenseStartDate = '';
            }
          }
        } else {
          this.oldLicenseFullSerialField.setValidators([CustomValidators.required, (control) => {
            return this.selectedLicense && this.selectedLicense?.fullSerial === control.value ? null : {select_license: true};
          }]);
        }
        this.oldLicenseFullSerialField.updateValueAndValidity();
      } else {
        this.requestType.setValue(this.requestType$.value);
      }
    });
  }

  setSelectedLicense(licenseDetails: Fundraising | undefined, ignoreUpdateForm: boolean) {
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
      this.licenseDurationTypeField.disable();
      value.licenseStartDate = licenseDetails.licenseStartDate || licenseDetails.licenseApprovedDate;
      // delete id because license details contains old license id, and we are adding new, so no id is needed
      delete value.id;
      delete value.vsId;

      this._updateForm(value);
    }
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (this.requestType.value !== CollectionRequestType.NEW && !this.selectedLicense) {
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
    this.resetForm$.next();
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
    throw new Error('Method not implemented.');
  }

  _launchFail(error: any): void {
    throw new Error('Method not implemented.');
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

  private loadSelectedLicenseById(id: string, callback?: any): void {
    if (!id) {
      return;
    }
    this.licenseService.loadFundraisingLicenseByLicenseId(id)
      .pipe(
        filter(license => !!license),
        takeUntil(this.destroy$)
      )
      .subscribe((license) => {
        this.setSelectedLicense(license, true);

        callback && callback();
      });
  }

  clearSelectedLicense(): void {
    this.setSelectedLicense(undefined, true);
    this.selectedLicense = undefined;
    if (!this.model?.id) {
      this.licenseDurationTypeField.enable();
    }
  }
}
