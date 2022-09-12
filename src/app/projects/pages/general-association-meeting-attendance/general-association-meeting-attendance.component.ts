import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, UntypedFormArray, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {SaveTypes} from '@app/enums/save-types';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {GeneralAssociationMeetingAttendance} from '@app/models/general-association-meeting-attendance';
import {LangService} from '@app/services/lang.service';
import {GeneralAssociationMeetingAttendanceService} from '@services/general-association-meeting-attendance.service';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
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
import {catchError, exhaustMap, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {SelectedLicenseInfo} from '@contracts/selected-license-info';
import {InternalProjectLicenseResult} from '@app/models/internal-project-license-result';
import {SharedService} from '@services/shared.service';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {CustomValidators} from '@app/validators/custom-validators';
import {CommonCaseStatus} from '@app/enums/common-case-status.enum';
import {OpenFrom} from '@app/enums/open-from.enum';
import {GeneralAssociationInternalMember} from '@app/models/general-association-internal-member';
import {MeetingAttendanceReport} from '@app/models/meeting-attendance-report';
import {TransferringIndividualFundsAbroadRequestTypeEnum} from '@app/enums/transferring-individual-funds-abroad-request-type-enum';
import {MeetingAttendanceSubItem} from '@app/models/meeting-attendance-sub-item';
import {MeetingAttendanceMainItem} from '@app/models/meeting-attendance-main-item';
import {GeneralMeetingAttendanceNote} from '@app/models/general-meeting-attendance-note';
import {MeetingMemberTaskStatus} from '@app/models/meeting-member-task-status';
import {MeetingPointMemberComment} from '@app/models/meeting-point-member-comment';

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
  importFinalReport$: Subject<void> = new Subject<void>();

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

  addGeneralNotesFormActive!: boolean;
  generalNotesForm!: FormGroup;
  generalNotes: GeneralMeetingAttendanceNote[] = [];
  selectedGeneralNote!: GeneralMeetingAttendanceNote | null;
  selectedGeneralNoteIndex!: number | null;
  generalNotesDisplayedColumns: string[] = ['index', 'comment', 'actions'];

  userCommentsDisplayedColumns: string[] = ['index', 'arName', 'enName', 'status', 'actions'];
  meetingUserTaskStatus: MeetingMemberTaskStatus[] = [];

  isMemberReview!: boolean;
  isDecisionMakerReview!: boolean;
  isManagerFinalReview!: boolean;
  memberId!: number;

  // meeting points form
  meetingPointsForm!: UntypedFormGroup;
  finalReportFile: any;
  finalReportExtensions: string[] = ['.pdf', '.doc', '.docx'];
  viewFinalReport$: Subject<void> = new Subject<void>();
  @ViewChild('finalReportUploader') finalReportUploader!: ElementRef;

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
    return this.form?.get('basicInfo')! as FormGroup;
  }

  get requestType(): UntypedFormControl {
    return this.form?.get('basicInfo.requestType')! as UntypedFormControl;
  }

  get oldLicenseFullSerialField(): AbstractControl {
    return this.form?.get('basicInfo.oldLicenseFullSerial')!;
  }

  get meetingDate(): FormControl {
    return this.form?.get('basicInfo.meetingDate')! as FormControl;
  }

  get meetingType(): FormControl {
    return this.form?.get('basicInfo.meetingType')! as FormControl;
  }

  get location(): FormControl {
    return this.form?.get('basicInfo.location')! as FormControl;
  }

  get meetingTime(): FormControl {
    return this.form?.get('basicInfo.meetingTime')! as FormControl;
  }

  get meetingInitiator(): FormControl {
    return this.form?.get('basicInfo.meetingInitiator')! as FormControl;
  }

  get meetingClassification(): FormControl {
    return this.form?.get('basicInfo.meetingClassification')! as FormControl;
  }

  get periodical(): FormControl {
    return this.form?.get('basicInfo.periodical')! as FormControl;
  }


  get specialExplanation(): FormGroup {
    return this.form?.get('explanation')! as FormGroup;
  }

  get oldFullSerialField(): AbstractControl {
    return this.form?.get('basicInfo.oldFullSerial')!;
  }

  get agendaItem(): FormControl {
    return this.agendaForm?.get('description')! as FormControl;
  }

  get generalNote(): FormGroup {
    return this.generalNotesForm?.value as FormGroup;
  }

  _initComponent(): void {
    // load initials here
    this.isExternalUser = this.employeeService.isExternalUser();
    this.memberId = this.employeeService.getCurrentUser()?.generalUserId!;
    this.buildAgendaForm();
    this.buildGeneralNotesForm();
    this.listenToImportFinalReport();
    this.listenToDownloadFinalReport();
    // this.initMeetingPointsForm();
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

    // update meeting form
    this.setMeetingPointsForm();

    this.service.getMeetingGeneralNotes(this.memberId, this.model?.id).subscribe(notes => {
      this.generalNotes = notes;
    });

    if (this.model?.isSentToMember() && this.model?.isDecisionMakerReviewStep()) {
      this.loadMembersTaskStatus();
    }

    this.isMemberReview = this.model?.isMemberReviewStep()!;
    this.isDecisionMakerReview = this.model?.isDecisionMakerReviewStep()!;
    this.isManagerFinalReview = this.model?.isManagerFinalReviewStep()!;
  }

  setMeetingPointsForm() {
    if (this.model?.isDecisionMakerReviewStep() || this.model?.isManagerFinalReviewStep()) {
      this.service.getMeetingPointsForDecisionMaker(this.model?.id).subscribe(meetingReport => {
        if (this.isMemberReview || ((this.isDecisionMakerReview || this.isManagerFinalReview) && meetingReport && meetingReport.meetingMainItem.length > 0)) {
          // get meeting attendance report
          this.updateMeetingPointsForm(meetingReport);
          // update meeting points form
        } else {
          this.buildMeetingPointsForm();
        }
      });
    }

    if (this.model?.isMemberReviewStep()) {
      this.service.getMeetingPointsForMember(this.model?.id).subscribe(meetingReport => {
        if (this.isMemberReview || (this.isDecisionMakerReview && meetingReport && meetingReport.meetingMainItem.length > 0)) {
          // get meeting attendance report
          this.updateMeetingPointsForm(meetingReport);
          // update meeting points form
        } else {
          this.buildMeetingPointsForm();
        }
      });
    }
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

    if (this.isSupervisionAndControlReviewStep && this.selectedInternalUsers && this.selectedInternalUsers.length < 1) {
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

  cancelAddAgendaItem() {
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

  // add general notes functionality
  buildGeneralNotesForm(): void {
    this.generalNotesForm = this.fb.group({
      id: [],
      caseID: [],
      memberID: [],
      comment: [null, [CustomValidators.required, CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX)]]
    });
  }

  openAddGeneralNotesForm() {
    this.addGeneralNotesFormActive = true;
  }

  selectGeneralNote(event: MouseEvent, item: GeneralMeetingAttendanceNote) {
    this.addGeneralNotesFormActive = true;
    event.preventDefault();
    this.selectedGeneralNote = item;
    this.generalNotesForm.patchValue(item);
    this.selectedGeneralNoteIndex = this.generalNotes.indexOf(item);
  }

  saveGeneralNote() {
    const item = new GeneralMeetingAttendanceNote().clone({...new GeneralMeetingAttendanceNote(), ...this.generalNote});
    item.caseID = item?.caseID ? item.caseID : this.model!.id;
    item.memberID = item?.memberID ? item.memberID : this.memberId;
    if (!this.selectedGeneralNote) {
      if (!this.isExistGeneralNoteInCaseOfAdd(this.generalNotes, item)) {
        this.generalNotes = this.generalNotes.concat(item);
        this.resetGeneralNotesForm();
        this.addGeneralNotesFormActive = false;
      } else {
        this.dialog.error(this.lang.map.selected_item_already_exists);
      }
    } else {
      if (!this.isExistGeneralNoteInCaseOfEdit(this.generalNotes, item, this.selectedGeneralNoteIndex!)) {
        let newList = this.generalNotes.slice();
        newList.splice(this.selectedGeneralNoteIndex!, 1);
        newList.splice(this.selectedGeneralNoteIndex!, 0, item);
        this.generalNotes = newList;
        this.resetGeneralNotesForm();
        this.addGeneralNotesFormActive = false;
      } else {
        this.dialog.error(this.lang.map.selected_item_already_exists);
      }
    }
  }

  cancelAddGeneralNote() {
    this.resetGeneralNotesForm();
    this.addGeneralNotesFormActive = false;
  }

  resetGeneralNotesForm() {
    this.selectedGeneralNote = null;
    this.selectedGeneralNoteIndex = null;
    this.generalNotesForm.reset();
  }

  removeGeneralNote(event: MouseEvent, item: GeneralMeetingAttendanceNote) {
    event.preventDefault();
    this.generalNotes = this.generalNotes.filter(x => x.id ? x.id !== item.id : x.comment !== item.comment);
    this.resetGeneralNotesForm();
  }

  isExistGeneralNoteInCaseOfAdd(generalNotes: GeneralMeetingAttendanceNote[], toBeAddedGeneralNote: GeneralMeetingAttendanceNote): boolean {
    return generalNotes.map(x => x.comment).includes(toBeAddedGeneralNote.comment);
  }

  isExistGeneralNoteInCaseOfEdit(generalNotes: GeneralMeetingAttendanceNote[], toBeEditedGeneralNote: GeneralMeetingAttendanceNote, selectedIndex: number): boolean {
    for (let i = 0; i < generalNotes.length; i++) {
      if (i === selectedIndex) {
        continue;
      }

      if (generalNotes[i].comment === toBeEditedGeneralNote.comment) {
        return true;
      }
    }
    return false;
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

  get isSupervisionAndControlReviewStep(): boolean {
    return this.model?.isSupervisionAndControlReviewStep()!;
  }

  // meeting points functionality
  initMeetingPointsForm(): void {
    this.meetingPointsForm = this.fb.group({
      meetingMainItem: this.fb.array([])
    });
  }

  buildMeetingPointsForm(): void {
    this.meetingPointsForm = this.fb.group({
      meetingMainItem: this.fb.array([this.newMainItem()])
    });
  }

  updateMeetingPointsForm(meetingReport: MeetingAttendanceReport): void {
    this.meetingPointsForm = this.fb.group({
      meetingMainItem: this.fb.array(meetingReport.meetingMainItem ? [...meetingReport.meetingMainItem.map(x => this.newMainItem(x))] : [this.newMainItem()])
    });
  }

  get mainItems(): UntypedFormArray {
    return this.meetingPointsForm?.get('meetingMainItem') as UntypedFormArray;
  }

  newMainItem(mainItem: MeetingAttendanceMainItem = new MeetingAttendanceMainItem()): FormGroup {
    return this.fb.group({
      id: [mainItem.id],
      enName: [mainItem.enName, [CustomValidators.required, CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]],
      meetingSubItem: this.fb.array(mainItem.meetingSubItem ? [...mainItem.meetingSubItem.map(x => this.newSubItem(x))] : [this.newSubItem()]),
      caseID: [mainItem.caseID],
      memberID: [mainItem.memberID],
      status: [mainItem.status],
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
    return this.mainItems.at(index)?.get('meetingSubItem') as UntypedFormArray;
  }

  getMembersComments(mainItemIndex: number, index: number): MeetingPointMemberComment[] {
    let mainItem = this.mainItems.at(mainItemIndex);
    let subItem = (mainItem.get('meetingSubItem') as UntypedFormArray).at(index) as FormGroup;
    return subItem.get('userComments')?.value as MeetingPointMemberComment[];
  }

  newSubItem(subItem: MeetingAttendanceSubItem = new MeetingAttendanceSubItem()): FormGroup {
    return this.fb.group({
      id: [subItem.id],
      enName: [subItem.enName, [CustomValidators.required, CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]],
      comment: [subItem.comment, this.isMemberReview ? [CustomValidators.required, CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)] : []],
      respectTerms: [subItem.respectTerms, []],
      mainItemID: [subItem.mainItemID],
      memberID: [subItem.memberID],
      status: [subItem.status],
      userComments: [subItem.userComments],
      selected: []
    });
  }

  addSubItem(index: number) {
    (this.mainItems.at(index)?.get('meetingSubItem') as UntypedFormArray).push(this.newSubItem());
  }

  removeSubItem(mainItemIndex: number, index: number) {
    if (this.getSubItems(mainItemIndex).length === 1) {
      this.dialog.error(this.lang.map.last_sub_meeting_point_can_not_be_deleted);
      return;
    }
    this.getSubItems(mainItemIndex).removeAt(index);
  }

  viewMeetingPointMembersComments(mainItemIndex: number, subItemIndex: number) {
    const membersComments = this.getMembersComments(mainItemIndex, subItemIndex);
    this.service.openViewPointMembersCommentsDialog(membersComments);
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
    this.service.addMeetingPoints(model, this.model?.id).subscribe(ret => {
      if (ret) {
        this.updateMeetingPointsForm(ret);
        this.dialog.success(this.lang.map.meeting_points_saved_successfully);
      }
    });
  }

  generateFinalReport() {
    let report = this.getSelectedMeetingPoints(new MeetingAttendanceReport().clone(this.meetingPointsForm.value));

    if (report.meetingMainItem.length === 0) {
      this.dialog.error(this.lang.map.you_have_to_add_at_least_one_meeting_point);
      return;
    }

    this.service.generateReport(this.model?.id!, report, this.generalNotes)
      .subscribe(blob => {
        window.open(blob.url);
      });
  }

  getSelectedMeetingPoints(report: MeetingAttendanceReport): MeetingAttendanceReport {
    report.meetingMainItem = report.meetingMainItem.map(mainItem => {
      mainItem.meetingSubItem = mainItem.meetingSubItem.filter(subItem => subItem.selected);
      return mainItem;
    }).filter(mainItem => mainItem.meetingSubItem.length > 0);
    return report;
  }

  saveGeneralNotes() {
    const meetingGeneralNotes = this.generalNotes.map(x => {
      return new GeneralMeetingAttendanceNote().clone(x);
    });
    this.service.addMeetingGeneralNotes(meetingGeneralNotes, this.model?.id).subscribe(ret => {
      this.dialog.success(this.lang.map.general_notes_saved_successfully);
      this.generalNotes = ret.map(x => {
        return new GeneralMeetingAttendanceNote().clone(x);
      });
    });
  }

  terminateUserTask(event: MouseEvent, item: MeetingMemberTaskStatus) {
    this.service.terminateMemberTask(item.pId).subscribe(_ => {
      this.dialog.success(this.lang.map.member_task_terminated_successfully);
      this.loadMembersTaskStatus();
    });
  }

  loadMembersTaskStatus() {
    this.service.getMemberTaskStatus(this.model?.id).subscribe(membersStatus => {
      this.meetingUserTaskStatus = [...membersStatus.map(x => new MeetingMemberTaskStatus().clone(x)).slice()];
    });
  }

  // import report summary functionality
  listenToImportFinalReport() {
    const documentTitle = 'test-title';
    this.importFinalReport$.pipe(
      takeUntil(this.destroy$),
      switchMap(() => {
        return this.service.uploadFinalReport(this.model?.id!, documentTitle, this.finalReportFile).pipe(
          catchError(_ => of(null))
        );
      })
    ).subscribe((vsId) => {
      if (vsId) {
        this.toast.success(this.lang.map.file_have_been_uploaded_successfully);
      }
    });
  }

  openFileBrowser($event: MouseEvent): void {
    $event?.stopPropagation();
    $event?.preventDefault();
    this.finalReportUploader?.nativeElement.click();
  }

  onReportSelected($event: Event): void {
    this.saveReportAfterSelect($event);
  }

  saveReportAfterSelect($event: Event) {
    let files = ($event.target as HTMLInputElement).files;
    if (files && files[0]) {
      const extension = files[0].name.getExtension().toLowerCase();
      if (this.finalReportExtensions.indexOf(extension) === -1) {
        this.dialog.error(this.lang.map.msg_invalid_format_allowed_formats.change({formats: this.finalReportExtensions.join(', ')}));
        this._clearReportUploader();
        return;
      }

      let reader = new FileReader();
      reader.readAsDataURL(files[0]);

      reader.onload = () => {
        // @ts-ignore
        this.finalReportFile = files[0];

        // save final report
        this.importFinalReport$.next();
      };
    }
  }

  private _clearReportUploader(): void {
    this.finalReportFile = null;
    this.finalReportUploader.nativeElement.value = '';
  }

  listenToDownloadFinalReport() {
    this.viewFinalReport$.pipe(
      takeUntil(this.destroy$),
      switchMap(() => {
        return this.service?.downloadFinalReport(this.model?.meetingReportID!)!;
      })
    ).subscribe(blob => {
      window.open(blob.url);
    });
  }
}
