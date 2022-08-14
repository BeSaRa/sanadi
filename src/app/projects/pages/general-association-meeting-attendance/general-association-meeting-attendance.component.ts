import {AfterViewInit, ChangeDetectorRef, Component} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {SaveTypes} from '@app/enums/save-types';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {GeneralAssociationMeetingAttendance} from '@app/models/general-association-meeting-attendance';
import {LangService} from '@app/services/lang.service';
import {GeneralAssociationMeetingAttendanceService} from '@services/general-association-meeting-attendance.service';
import {Observable} from 'rxjs';
import {LookupService} from '@services/lookup.service';
import {DialogService} from '@services/dialog.service';
import {ToastService} from '@services/toast.service';
import {LicenseService} from '@services/license.service';
import {FormManager} from '@app/models/form-manager';
import {DatepickerControlsMap, DatepickerOptionsMap} from '@app/types/types';
import {DateUtils} from '@helpers/date-utils';
import {EmployeeService} from '@services/employee.service';
import {GeneralAssociationExternalMember} from '@app/models/general-association-external-member';
import {Lookup} from '@app/models/lookup';
import {exhaustMap, filter, map, takeUntil, tap} from 'rxjs/operators';
import {SelectedLicenseInfo} from '@contracts/selected-license-info';
import {InternalProjectLicenseResult} from '@app/models/internal-project-license-result';
import {SharedService} from '@services/shared.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {AdminResult} from '@app/models/admin-result';

@Component({
  selector: 'general-association-meeting-attendance',
  templateUrl: './general-association-meeting-attendance.component.html',
  styleUrls: ['./general-association-meeting-attendance.component.scss']
})
export class GeneralAssociationMeetingAttendanceComponent extends EServicesGenericComponent<GeneralAssociationMeetingAttendance, GeneralAssociationMeetingAttendanceService> implements AfterViewInit {
  form!: FormGroup;
  administrativeBoardMembersForm!: FormGroup;
  generalAssociationMembersForm!: FormGroup;
  internalMembersForm!: FormGroup;
  fm!: FormManager;
  private displayedColumns: string[] = ['fullSerial', 'status', 'requestTypeInfo', 'actions'];

  selectedLicenses: GeneralAssociationMeetingAttendance[] = [];
  selectedLicenseDisplayedColumns: string[] = ['serial', 'requestType', 'licenseStatus', 'actions'];
  hasSearchedForLicense = false;

  requestTypes: Lookup[] = this.lookupService.listByCategory.CollectionRequestType
    .sort((a, b) => a.lookupKey - b.lookupKey);
  meetingTypes: Lookup[] = this.lookupService.listByCategory.MeetingType
    .sort((a, b) => a.lookupKey - b.lookupKey);
  meetingClassifications: Lookup[] = this.lookupService.listByCategory.MeetingClassification
    .sort((a, b) => a.lookupKey - b.lookupKey);

  datepickerControlsMap: DatepickerControlsMap = {};
  datepickerOptionsMap: DatepickerOptionsMap = {
    meetingDate: DateUtils.getDatepickerOptions({disablePeriod: 'past'})
  };

  isExternalUser!: boolean;
  addAdministrativeBoardMemberFormActive!: boolean;
  addGeneralAssociationMemberFormActive!: boolean;

  selectedAdministrativeBoardMember!: GeneralAssociationExternalMember | null;
  selectedAdministrativeBoardMembers: GeneralAssociationExternalMember[] = [];
  selectedAdministrativeBoardMemberIndex!: number | null;

  selectedGeneralAssociationMember!: GeneralAssociationExternalMember | null;
  selectedGeneralAssociationMembers: GeneralAssociationExternalMember[] = [];
  selectedGeneralAssociationMemberIndex!: number | null;

  membersDisplayedColumns: string[] = ['arabicName', 'englishName', 'identificationNumber', 'jobTitle', 'actions'];

  constructor(public lang: LangService,
              public fb: FormBuilder,
              private cd: ChangeDetectorRef,
              public service: GeneralAssociationMeetingAttendanceService,
              private lookupService: LookupService,
              private dialog: DialogService,
              private toast: ToastService,
              private licenseService: LicenseService,
              private employeeService: EmployeeService,
              private sharedService: SharedService) {
    super();
  }

  get basicInfo(): FormGroup {
    return this.form.get('basicInfo')! as FormGroup;
  }

  get meetingDate(): FormControl {
    return this.form.get('basicInfo.meetingDate')! as FormControl;
  }

  get specialExplanation(): FormGroup {
    return this.form.get('explanation')! as FormGroup;
  }

  get oldFullSerialField(): AbstractControl {
    return this.form.get('basicInfo.oldFullSerial')!;
  }

  _initComponent(): void {
    // load initials here
    this.isExternalUser = this.employeeService.isExternalUser();
    this.buildAdministrativeBoardMemberForm();
    this.buildGeneralAssociationMemberForm();
  }

  _buildForm(): void {
    const model = new GeneralAssociationMeetingAttendance();
    this.form = this.fb.group({
      basicInfo: this.fb.group(model.buildBasicInfo(true)),
      explanation: this.fb.group(model.buildExplanation(true))
    });

    this._buildDatepickerControlsMap();
    this.fm = new FormManager(this.form, this.lang);
  }

  _afterBuildForm(): void {

  }

  _updateForm(model: GeneralAssociationMeetingAttendance | undefined): void {

  }

  _resetForm(): void {
    this.form.reset();
  }

  _prepareModel(): GeneralAssociationMeetingAttendance | Observable<GeneralAssociationMeetingAttendance> {
    return new GeneralAssociationMeetingAttendance();
  }

  _getNewInstance(): GeneralAssociationMeetingAttendance {
    return new GeneralAssociationMeetingAttendance();
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    // extra validation here
    return this.form.valid;
  }

  _afterSave(model: GeneralAssociationMeetingAttendance, saveType: SaveTypes, operation: OperationTypes): void {
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

  ngAfterViewInit(): void {
    this.cd.detectChanges();
  }

  private _buildDatepickerControlsMap() {
    this.datepickerControlsMap = {
      meetingDate: this.meetingDate
    };
  }

  private validateSingleLicense(license: GeneralAssociationMeetingAttendance): Observable<null | SelectedLicenseInfo<GeneralAssociationMeetingAttendance, GeneralAssociationMeetingAttendance>> {
    return this.licenseService.validateLicenseByRequestType<GeneralAssociationMeetingAttendance>(this.model!.caseType, this.model!.requestType, license.id)
      .pipe(map(validated => {
        return (validated ? {
          selected: validated,
          details: validated
        } : null) as (null | SelectedLicenseInfo<GeneralAssociationMeetingAttendance, GeneralAssociationMeetingAttendance>);
      }));
  }

  private openSelectLicense(licenses: GeneralAssociationMeetingAttendance[]) {
    return this.licenseService.openSelectLicenseDialog(licenses, this.model, true, this.displayedColumns).onAfterClose$ as Observable<{ selected: GeneralAssociationMeetingAttendance, details: GeneralAssociationMeetingAttendance }>;
  }

  searchForLicense() {
    this.licenseService
      .generalAssociationMeetingAttendanceSearch<GeneralAssociationMeetingAttendance>({fullSerial: this.oldFullSerialField.value})
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(licenses => !licenses.length && this.dialog.info(this.lang.map.no_result_for_your_search_criteria)))
      .pipe(filter(licenses => !!licenses.length))
      .pipe(exhaustMap((licenses) => {
        return licenses.length === 1 ? this.validateSingleLicense(licenses[0]) : this.openSelectLicense(licenses);
      }))
      .pipe(
        filter<null | SelectedLicenseInfo<GeneralAssociationMeetingAttendance, GeneralAssociationMeetingAttendance>, SelectedLicenseInfo<GeneralAssociationMeetingAttendance, GeneralAssociationMeetingAttendance>>
        ((info): info is SelectedLicenseInfo<GeneralAssociationMeetingAttendance, GeneralAssociationMeetingAttendance> => !!info))
      .subscribe((_info) => {
        // set oldLicenseId property from validated object id
        _info.details.oldFullSerial = _info.details.id;

        // delete id property
        let tempObj = _info.details as any;
        delete tempObj.id;
        _info.details = new GeneralAssociationMeetingAttendance().clone(tempObj);

        this.hasSearchedForLicense = true;
        this.selectedLicenses = [_info.details];
        _info.details.requestType = this.model?.requestType!;
        this._updateForm(_info.details);
        this.oldFullSerialField.patchValue(_info.details.fullSerial);
      });
  }

  viewSelectedLicense(): void {
    let license = {
      documentTitle: this.selectedLicenses[0].fullSerial,
      id: this.selectedLicenses[0].id
    } as InternalProjectLicenseResult;
    this.licenseService.showLicenseContent(license, this.selectedLicenses[0].getCaseType())
      .subscribe((file) => {
        this.sharedService.openViewContentDialog(file, license);
      });
  }

  // add/edit administrative board members functionality
  openAddAdministrativeBoardMemberForm() {
    this.addAdministrativeBoardMemberFormActive = true;
  }

  selectAdministrativeBoardMember(event: MouseEvent, model: GeneralAssociationExternalMember) {
    this.addAdministrativeBoardMemberFormActive = true;
    event.preventDefault();
    this.selectedAdministrativeBoardMember = model;
    this.administrativeBoardMembersForm.patchValue(this.selectedAdministrativeBoardMember!);
    this.selectedAdministrativeBoardMemberIndex = this.selectedAdministrativeBoardMembers
      .map(x => x.identificationNumber).indexOf(model.identificationNumber);
  }

  saveAdministrativeBoardMember() {
    const boardMember = new GeneralAssociationExternalMember().clone(this.administrativeBoardMembersForm.getRawValue());
    if (!this.selectedAdministrativeBoardMember) {
      if (!this.isExistMemberInCaseOfAdd(this.selectedAdministrativeBoardMembers, boardMember)) {
        this.selectedAdministrativeBoardMembers = this.selectedAdministrativeBoardMembers.concat(boardMember);
        this.resetAdministrativeBoardMemberForm();
        this.addAdministrativeBoardMemberFormActive = false;
      } else {
        this.dialog.error(this.lang.map.selected_item_already_exists);
      }
    } else {
      if (!this.isExistMemberInCaseOfEdit(this.selectedAdministrativeBoardMembers, boardMember, this.selectedAdministrativeBoardMemberIndex!)) {
        let newList = this.selectedAdministrativeBoardMembers.slice();
        newList.splice(this.selectedAdministrativeBoardMemberIndex!, 1);
        newList.splice(this.selectedAdministrativeBoardMemberIndex!, 0, boardMember);
        this.selectedAdministrativeBoardMembers = newList;
        this.resetAdministrativeBoardMemberForm();
        this.addAdministrativeBoardMemberFormActive = false;
      } else {
        this.dialog.error(this.lang.map.selected_item_already_exists);
      }
    }
  }

  cancelAddAdministrativeBoardMember() {
    this.resetAdministrativeBoardMemberForm();
    this.addAdministrativeBoardMemberFormActive = false;
  }

  resetAdministrativeBoardMemberForm() {
    this.selectedAdministrativeBoardMember = null;
    this.selectedAdministrativeBoardMemberIndex = null;
    this.administrativeBoardMembersForm.reset();
  }

  removeAdministrativeBoardMember(event: MouseEvent, model: GeneralAssociationExternalMember) {
    event.preventDefault();
    this.selectedAdministrativeBoardMembers = this.selectedAdministrativeBoardMembers.filter(x => x.identificationNumber != model.identificationNumber);
    this.resetAdministrativeBoardMemberForm();
  }

  // add/edit general association members functionality
  openAddGeneralAssociationMemberForm() {
    this.addGeneralAssociationMemberFormActive = true;
  }

  selectGeneralAssociationMember(event: MouseEvent, model: GeneralAssociationExternalMember) {
    this.addGeneralAssociationMemberFormActive = true;
    event.preventDefault();
    this.selectedGeneralAssociationMember = model;
    this.generalAssociationMembersForm.patchValue(this.selectedGeneralAssociationMember!);
    this.selectedGeneralAssociationMemberIndex = this.selectedGeneralAssociationMembers
      .map(x => x.identificationNumber).indexOf(model.identificationNumber);
  }

  saveGeneralAssociationMember() {
    const boardMember = new GeneralAssociationExternalMember().clone(this.generalAssociationMembersForm.getRawValue());
    boardMember.jobTitleInfo = boardMember.jobTitleInfo ? boardMember.jobTitleInfo : AdminResult.createInstance(boardMember.jobTitleInfo);
    if (!this.selectedGeneralAssociationMember) {
      if (!this.isExistMemberInCaseOfAdd(this.selectedGeneralAssociationMembers, boardMember)) {
        this.selectedGeneralAssociationMembers = this.selectedGeneralAssociationMembers.concat(boardMember);
        this.resetGeneralAssociationMemberForm();
        this.addGeneralAssociationMemberFormActive = false;
      } else {
        this.dialog.error(this.lang.map.selected_item_already_exists);
      }
    } else {
      if (!this.isExistMemberInCaseOfEdit(this.selectedGeneralAssociationMembers, boardMember, this.selectedGeneralAssociationMemberIndex!)) {
        let newList = this.selectedGeneralAssociationMembers.slice();
        newList.splice(this.selectedGeneralAssociationMemberIndex!, 1);
        newList.splice(this.selectedGeneralAssociationMemberIndex!, 0, boardMember);
        this.selectedGeneralAssociationMembers = newList;
        this.resetGeneralAssociationMemberForm();
        this.addGeneralAssociationMemberFormActive = false;
      } else {
        this.dialog.error(this.lang.map.selected_item_already_exists);
      }
    }
  }

  cancelAddGeneralAssociationMember() {
    this.resetGeneralAssociationMemberForm();
    this.addGeneralAssociationMemberFormActive = false;
  }

  resetGeneralAssociationMemberForm() {
    this.selectedGeneralAssociationMember = null;
    this.selectedGeneralAssociationMemberIndex = null;
    this.generalAssociationMembersForm.reset();
  }

  removeGeneralAssociationMember(event: MouseEvent, model: GeneralAssociationExternalMember) {
    event.preventDefault();
    this.selectedGeneralAssociationMembers = this.selectedGeneralAssociationMembers.filter(x => x.identificationNumber != model.identificationNumber);
    this.resetGeneralAssociationMemberForm();
  }

  isExistMemberInCaseOfAdd(selectedMembers: GeneralAssociationExternalMember[], toBeAddedMember: GeneralAssociationExternalMember): boolean {
    return selectedMembers.some(x => x.identificationNumber === toBeAddedMember.identificationNumber);
  }

  isExistMemberInCaseOfEdit(selectedMembers: GeneralAssociationExternalMember[], toBeEditedMember: GeneralAssociationExternalMember, selectedIndex: number): boolean {
    for (let i = 0; i < selectedMembers.length; i++) {
      if(i === selectedIndex) {
        continue;
      }

      if(selectedMembers[i].identificationNumber === toBeEditedMember.identificationNumber) {
        return true;
      }
    }
    return false;
  }

  buildAdministrativeBoardMemberForm(): void {
    this.administrativeBoardMembersForm = this.fb.group({
      arabicName: [null, [CustomValidators.required, CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX)]],
      englishName: [null, [CustomValidators.required, CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]],
      identificationNumber: [null, [CustomValidators.required].concat(CustomValidators.commonValidations.qId)],
      jobTitleId: [null, [CustomValidators.required]]
    });
  }

  buildGeneralAssociationMemberForm(): void {
    this.generalAssociationMembersForm = this.fb.group({
      arabicName: [null, [CustomValidators.required, CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX)]],
      englishName: [null, [CustomValidators.required, CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]],
      identificationNumber: [null, [CustomValidators.required].concat(CustomValidators.commonValidations.qId)],
      jobTitleId: [null, [CustomValidators.required]]
    });
  }
}
