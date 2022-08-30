import {AfterViewInit, ChangeDetectorRef, Component} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, UntypedFormArray, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {SaveTypes} from '@app/enums/save-types';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {GeneralAssociationMeetingAttendance} from '@app/models/general-association-meeting-attendance';
import {LangService} from '@app/services/lang.service';
import {GeneralAssociationMeetingAttendanceService} from '@services/general-association-meeting-attendance.service';
import {BehaviorSubject, Observable} from 'rxjs';
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
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {CustomValidators} from '@app/validators/custom-validators';
import {CommonCaseStatus} from '@app/enums/common-case-status.enum';
import {OpenFrom} from '@app/enums/open-from.enum';
import {GeneralAssociationInternalMember} from '@app/models/general-association-internal-member';
import {GeneralAssociationMeetingStepNameEnum} from '@app/enums/general-association-meeting-step-name-enum';
import {MeetingAttendanceReport} from '@app/models/meeting-attendance-report';
import {TransferringIndividualFundsAbroadRequestTypeEnum} from '@app/enums/transferring-individual-funds-abroad-request-type-enum';
import {MeetingAttendanceSubItem} from '@app/models/meeting-attendance-sub-item';
import {MeetingAttendanceMainItem} from '@app/models/meeting-attendance-main-item';

@Component({
  selector: 'general-association-meeting-attendance',
  templateUrl: './general-association-meeting-attendance.component.html',
  styleUrls: ['./general-association-meeting-attendance.component.scss']
})
export class GeneralAssociationMeetingAttendanceComponent extends EServicesGenericComponent<GeneralAssociationMeetingAttendance, GeneralAssociationMeetingAttendanceService> implements AfterViewInit {
  form!: FormGroup;
  internalMembersForm!: FormGroup;
  fm!: FormManager;
  private displayedColumns: string[] = ['fullSerial', 'status', 'requestTypeInfo', 'actions'];
  addAdministrativeBoardMembersLabel: keyof ILanguageKeys = 'add_administrative_board_member';
  addGeneralAssociationMembersLabel: keyof ILanguageKeys = 'add_general_association_members';

  selectedLicenses: GeneralAssociationMeetingAttendance[] = [];
  selectedLicenseDisplayedColumns: string[] = ['serial', 'requestType', 'licenseStatus', 'actions'];
  hasSearchedForLicense = false;
  commonCaseStatus = CommonCaseStatus;
  isCancel!: boolean;

  requestTypes: Lookup[] = this.lookupService.listByCategory.CollectionRequestType
    .sort((a, b) => a.lookupKey - b.lookupKey);
  meetingTypes: Lookup[] = this.lookupService.listByCategory.MeetingType
    .sort((a, b) => a.lookupKey - b.lookupKey);
  meetingClassifications: Lookup[] = this.lookupService.listByCategory.MeetingClassification
    .sort((a, b) => a.lookupKey - b.lookupKey);

  datepickerControlsMap: DatepickerControlsMap = {};
  datepickerOptionsMap!: DatepickerOptionsMap;

  isExternalUser!: boolean;
  selectedAdministrativeBoardMembers: GeneralAssociationExternalMember[] = [];
  selectedGeneralAssociationMembers: GeneralAssociationExternalMember[] = [];
  selectedInternalUsers: GeneralAssociationInternalMember[] = [];
  requestTypeChanged: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);

  addAgendaFormActive!: boolean;
  agendaForm!: FormGroup;
  agendaItems: string[] = [];
  selectedAgendaItem!: string | null;
  selectedAgendaItemIndex!: number | null;
  agendaItemsDisplayedColumns: string[] = ['index', 'description', 'actions'];

  // meeting points form
  meetingPointsForm!: UntypedFormGroup;
  caseSteps = GeneralAssociationMeetingStepNameEnum;

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

  get requestType(): UntypedFormControl {
    return this.form.get('basicInfo.requestType')! as UntypedFormControl;
  }

  get oldLicenseFullSerialField(): AbstractControl {
    return this.form.get('basicInfo.oldLicenseFullSerial')!;
  }

  get meetingDate(): FormControl {
    return this.form.get('basicInfo.meetingDate')! as FormControl;
  }

  get meetingType(): FormControl {
    return this.form.get('basicInfo.meetingType')! as FormControl;
  }

  get location(): FormControl {
    return this.form.get('basicInfo.location')! as FormControl;
  }

  get meetingTime(): FormControl {
    return this.form.get('basicInfo.meetingTime')! as FormControl;
  }

  get meetingInitiator(): FormControl {
    return this.form.get('basicInfo.meetingInitiator')! as FormControl;
  }

  get meetingClassification(): FormControl {
    return this.form.get('basicInfo.meetingClassification')! as FormControl;
  }

  get periodical(): FormControl {
    return this.form.get('basicInfo.periodical')! as FormControl;
  }


  get specialExplanation(): FormGroup {
    return this.form.get('explanation')! as FormGroup;
  }

  get oldFullSerialField(): AbstractControl {
    return this.form.get('basicInfo.oldFullSerial')!;
  }

  get agendaItem(): FormControl {
    return this.agendaForm.get('description')! as FormControl;
  }

  _initComponent(): void {
    // load initials here
    this.isExternalUser = this.employeeService.isExternalUser();
    this.buildAgendaForm();
    this.buildMeetingPointsForm();

    if (true) {
      // get meeting attendance report

      const meetingReport: MeetingAttendanceReport = new MeetingAttendanceReport().clone({
        meetingMainItem: [new MeetingAttendanceMainItem().clone({
          enName: '111',
          meetingSubItem: [new MeetingAttendanceSubItem().clone({
            enName: '111 111'
          }), new MeetingAttendanceSubItem().clone({
            enName: '111 222'
          }), new MeetingAttendanceSubItem().clone({
            enName: '111 333'
          })]
        }), new MeetingAttendanceMainItem().clone({
          enName: '222',
          meetingSubItem: [new MeetingAttendanceSubItem().clone({
            enName: '222 111'
          }), new MeetingAttendanceSubItem().clone({
            enName: '222 222'
          })]
        })]
      });

      // update meeting points form
    }
  }

  _buildForm(): void {
    const model = new GeneralAssociationMeetingAttendance();
    this.form = this.fb.group({
      basicInfo: this.fb.group(model.buildBasicInfo(true)),
      explanation: this.fb.group(model.buildExplanation(true))
    });

    this.setDatePeriodValidation();

    this._buildDatepickerControlsMap();
    this.fm = new FormManager(this.form, this.lang);
  }

  _afterBuildForm(): void {
    this.listenToRequestTypeSubject();
    this.listenToRequestTypeChange();
    this.handleReadonly();
  }

  _updateForm(model: GeneralAssociationMeetingAttendance | undefined): void {
    if (!model) {
      return;
    }

    this.model = new GeneralAssociationMeetingAttendance().clone({...this.model, ...model});
    this.form.patchValue({
      basicInfo: this.model?.buildBasicInfo(),
      explanation: this.model?.buildExplanation()
    });

    this.selectedAdministrativeBoardMembers = this.model?.administrativeBoardMembers;
    this.selectedGeneralAssociationMembers = this.model?.generalAssociationMembers;
    this.selectedInternalUsers = this.model?.internalMembersDTO;
    this.agendaItems = this.getAgendaItemsAsJson(this.model?.agenda);

    this.setDatePeriodValidation();
    this.requestTypeChanged.next(this.requestType.value);
  }

  private setDatePeriodValidation() {
    if (this.operation === OperationTypes.CREATE) {
      this.datepickerOptionsMap = {
        meetingDate: DateUtils.getDatepickerOptions({disablePeriod: 'past'})
      };
    } else {
      this.datepickerOptionsMap = {
        meetingDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'})
      };
    }
  }

  _resetForm(): void {
    this.form.reset();
    this.hasSearchedForLicense = false;
  }

  _prepareModel(): GeneralAssociationMeetingAttendance | Observable<GeneralAssociationMeetingAttendance> {
    return new GeneralAssociationMeetingAttendance().clone({
      ...this.model,
      ...this.basicInfo.getRawValue(),
      ...this.specialExplanation.getRawValue(),
      administrativeBoardMembers: this.selectedAdministrativeBoardMembers,
      generalAssociationMembers: this.selectedGeneralAssociationMembers,
      internalMembersDTO: this.selectedInternalUsers,
      agenda: this.getAgendaItemsAsString(this.agendaItems)
    });
  }

  _getNewInstance(): GeneralAssociationMeetingAttendance {
    return new GeneralAssociationMeetingAttendance();
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (this.selectedAdministrativeBoardMembers && this.selectedAdministrativeBoardMembers.length < 1) {
      this.dialog.error(this.lang.map.you_should_add_at_least_one_person_to_administrative_board_members);
      return false;
    }

    if (this.selectedGeneralAssociationMembers && this.selectedGeneralAssociationMembers.length < 1) {
      this.dialog.error(this.lang.map.you_should_add_at_least_one_person_to_general_association_members);
      return false;
    }

    if (this.agendaItems && this.agendaItems.length < 1) {
      this.dialog.error(this.lang.map.you_should_add_at_least_one_item_to_meeting_agenda);
      return false;
    }

    if (this.isSupervisionAndControlSecretary && this.selectedInternalUsers && this.selectedInternalUsers.length < 1) {
      this.dialog.error(this.lang.map.you_should_add_at_least_one_member_to_internal_users);
      return false;
    }

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
    this.selectedAdministrativeBoardMembers = [];
    this.selectedGeneralAssociationMembers = [];
    this.agendaItems = [];
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }

  _launchFail(error: any): void {

  }

  _destroyComponent(): void {

  }

  ngAfterViewInit(): void {
    this.cd.detectChanges();
  }

  listenToRequestTypeChange() {
    this.requestType.valueChanges.subscribe(value => {
      this.requestTypeChanged.next(value);
    });
  }

  listenToRequestTypeSubject() {
    this.requestTypeChanged
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        if (value) {
          this.model!.requestType = value;
        }
        if (!value || value === TransferringIndividualFundsAbroadRequestTypeEnum.NEW) {
          this.enableAllFormsInCaseOfNotCancelRequest();
          this.disableSearchField();
          this.isCancel = false;
        } else if (value === TransferringIndividualFundsAbroadRequestTypeEnum.UPDATE) {
          this.enableAllFormsInCaseOfNotCancelRequest();
          this.enableSearchField();
          this.isCancel = false;
        } else {
          this.disableAllFormsInCaseOfCancelRequest();
          this.enableSearchField();
          this.isCancel = true;
        }
      });
  }

  enableAllFormsInCaseOfNotCancelRequest() {
    this.meetingType.enable();
    this.location.enable();
    this.meetingDate.enable();
    this.meetingTime.enable();
    this.meetingInitiator.enable();
    this.meetingClassification.enable();
    this.periodical.enable();
    this.specialExplanation.enable();

    this.form.updateValueAndValidity();
  }

  disableAllFormsInCaseOfCancelRequest() {
    this.meetingType.disable();
    this.location.disable();
    this.meetingDate.disable();
    this.meetingTime.disable();
    this.meetingInitiator.disable();
    this.meetingClassification.disable();
    this.periodical.disable();
    this.basicInfo.updateValueAndValidity();

    this.specialExplanation.disable();
    this.specialExplanation.updateValueAndValidity();

    this.form.updateValueAndValidity();
  }

  enableSearchField() {
    this.oldLicenseFullSerialField.enable();
    this.setOldLicenseFullSerialRequired();
  }

  disableSearchField() {
    this.oldLicenseFullSerialField.patchValue(null);
    this.oldLicenseFullSerialField.disable();
    this.oldLicenseFullSerialField.setValidators([]);
    this.oldLicenseFullSerialField.updateValueAndValidity();
  }

  setOldLicenseFullSerialRequired() {
    this.oldLicenseFullSerialField.setValidators([CustomValidators.required, CustomValidators.maxLength(50)]);
    this.oldLicenseFullSerialField.updateValueAndValidity();
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

  onAdministrativeBoardMembersChanged(memberList: GeneralAssociationExternalMember[]) {
    this.selectedAdministrativeBoardMembers = memberList;
  }

  onGeneralAssociationMembersChanged(memberList: GeneralAssociationExternalMember[]) {
    this.selectedGeneralAssociationMembers = memberList;
  }

  onInternalMembersChanged(memberList: GeneralAssociationInternalMember[]) {
    this.selectedInternalUsers = memberList;
  }

  // add agenda items functionality
  buildAgendaForm(): void {
    this.agendaForm = this.fb.group({
      description: [null, [CustomValidators.required, CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX)]]
    });
  }

  openAddAgendaForm() {
    this.addAgendaFormActive = true;
  }

  selectAgendaItem(event: MouseEvent, item: string) {
    this.addAgendaFormActive = true;
    event.preventDefault();
    this.selectedAgendaItem = item;
    this.agendaForm.patchValue({description: this.selectedAgendaItem!});
    this.selectedAgendaItemIndex = this.agendaItems.indexOf(item);
  }

  saveAgendaItem() {
    const item = this.agendaItem.value;
    if (!this.selectedAgendaItem) {
      if (!this.isExistAgendaItemInCaseOfAdd(this.agendaItems, item)) {
        this.agendaItems = this.agendaItems.concat(item);
        this.resetAgendaForm();
        this.addAgendaFormActive = false;
      } else {
        this.dialog.error(this.lang.map.selected_item_already_exists);
      }
    } else {
      if (!this.isExistAgendaItemInCaseOfEdit(this.agendaItems, item, this.selectedAgendaItemIndex!)) {
        let newList = this.agendaItems.slice();
        newList.splice(this.selectedAgendaItemIndex!, 1);
        newList.splice(this.selectedAgendaItemIndex!, 0, item);
        this.agendaItems = newList;
        this.resetAgendaForm();
        this.addAgendaFormActive = false;
      } else {
        this.dialog.error(this.lang.map.selected_item_already_exists);
      }
    }
  }

  cancelAddMember() {
    this.resetAgendaForm();
    this.addAgendaFormActive = false;
  }

  resetAgendaForm() {
    this.selectedAgendaItem = null;
    this.selectedAgendaItemIndex = null;
    this.agendaForm.reset();
  }

  removeAgendaItem(event: MouseEvent, item: string) {
    event.preventDefault();
    this.agendaItems = this.agendaItems.filter(x => x != item);
    this.resetAgendaForm();
  }

  isExistAgendaItemInCaseOfAdd(agendaItems: string[], toBeAddedAgendaItem: string): boolean {
    return agendaItems.includes(toBeAddedAgendaItem);
  }

  isExistAgendaItemInCaseOfEdit(agendaItems: string[], toBeEditedAgendaItem: string, selectedIndex: number): boolean {
    for (let i = 0; i < agendaItems.length; i++) {
      if (i === selectedIndex) {
        continue;
      }

      if (agendaItems[i] === toBeEditedAgendaItem) {
        return true;
      }
    }
    return false;
  }

  getAgendaItemsAsString(agendaItems: string[]): string {
    return JSON.stringify(agendaItems);
  }

  getAgendaItemsAsJson(agendaItems: string) {
    if (agendaItems) {
      return JSON.parse(agendaItems);
    }
    return [];
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
      // if saved as draft and opened by creator who is charity user, then no readonly
      if (this.model?.canCommit()) {
        this.readonly = false;
      }
    }
  }

  get isSupervisionAndControlManager(): boolean {
    return this.employeeService.isSupervisionAndControlManager();
  }

  get isSupervisionAndControlSecretary(): boolean {
    return this.employeeService.isSupervisionAndControlSecretary();
  }

  // meeting points functionality
  buildMeetingPointsForm(): void {
    this.meetingPointsForm = this.fb.group({
      meetingMainItem: this.fb.array([this.newMainItem()])
    });
  }

  get mainItems(): UntypedFormArray {
    return this.meetingPointsForm.get('meetingMainItem') as UntypedFormArray;
  }

  newMainItem(): FormGroup {
    return this.fb.group({
      enName: [null, [CustomValidators.required, CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]],
      meetingSubItem: this.fb.array([this.newSubItem()])
    });
  }

  addMainItem() {
    this.mainItems.push(this.newMainItem());
  }

  removeMainItem(i: number) {
    if (this.mainItems.length === 1) {
      this.dialog.error(this.lang.map.last_main_meeting_point_can_not_be_deleted);
      return;
    }
    this.mainItems.removeAt(i);
  }

  getSubItems(index: number): UntypedFormArray {
    return this.mainItems.at(index).get('meetingSubItem') as UntypedFormArray;
  }

  newSubItem(): FormGroup {
    return this.fb.group({
      enName: [null, [CustomValidators.required, CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]],
      comment: [null, []],
      respectTerms: [false, []]
    });
  }

  addSubItem(index: number) {
    (this.mainItems.at(index).get('meetingSubItem') as UntypedFormArray).push(this.newSubItem());
  }

  removeSubItem(mainItemIndex: number, index: number) {
    if (this.getSubItems(mainItemIndex).length === 1) {
      this.dialog.error(this.lang.map.last_sub_meeting_point_can_not_be_deleted);
      return;
    }
    this.getSubItems(mainItemIndex).removeAt(index);
  }

  getRemoveMainItemClass() {
    if (this.lang.map.lang === 'en') {
      return {'remove-main-item-right': true, 'remove-main-item-left': false};
    } else {
      return {'remove-main-item-right': false, 'remove-main-item-left': true};
    }
  }

  getRemoveSubItemClass() {
    if (this.lang.map.lang === 'en') {
      return {'remove-sub-item-right': true, 'remove-sub-item-left': false};
    } else {
      return {'remove-sub-item-right': false, 'remove-sub-item-left': true};
    }
  }

  saveMeetingPoints() {
    const model = new MeetingAttendanceReport().clone(this.meetingPointsForm.value);
    this.service.addMeetingPoints(model, this.model?.taskDetails.tkiid).subscribe(ret => {
      console.log('returned items', ret);
    });
  }
}
