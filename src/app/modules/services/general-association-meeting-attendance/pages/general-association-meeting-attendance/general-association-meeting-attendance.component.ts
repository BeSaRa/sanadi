import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup
} from '@angular/forms';
import {OperationTypes} from '@enums/operation-types.enum';
import {SaveTypes} from '@enums/save-types';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {GeneralAssociationMeetingAttendance} from '@models/general-association-meeting-attendance';
import {LangService} from '@services/lang.service';
import {GeneralAssociationMeetingAttendanceService} from '@services/general-association-meeting-attendance.service';
import {Observable, of, Subject} from 'rxjs';
import {LookupService} from '@services/lookup.service';
import {DialogService} from '@services/dialog.service';
import {ToastService} from '@services/toast.service';
import {LicenseService} from '@services/license.service';
import {DatepickerControlsMap, DatepickerOptionsMap, TabMap} from '@app/types/types';
import {DateUtils} from '@helpers/date-utils';
import {EmployeeService} from '@services/employee.service';
import {Lookup} from '@models/lookup';
import {catchError, exhaustMap, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {SelectedLicenseInfo} from '@contracts/selected-license-info';
import {InternalProjectLicenseResult} from '@models/internal-project-license-result';
import {SharedService} from '@services/shared.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {CommonCaseStatus} from '@enums/common-case-status.enum';
import {OpenFrom} from '@enums/open-from.enum';
import {GeneralAssociationInternalMember} from '@models/general-association-internal-member';
import {MeetingAttendanceReport} from '@models/meeting-attendance-report';
import {GeneralAssociationMeetingRequestTypeEnum} from '@enums/service-request-types';
import {MeetingAttendanceSubItem} from '@models/meeting-attendance-sub-item';
import {MeetingAttendanceMainItem} from '@models/meeting-attendance-main-item';
import {GeneralMeetingAttendanceNote} from '@models/general-meeting-attendance-note';
import {MeetingMemberTaskStatus} from '@models/meeting-member-task-status';
import {MeetingPointMemberComment} from '@models/meeting-point-member-comment';
import {UserClickOn} from '@enums/user-click-on.enum';
import {CommonUtils} from '@helpers/common-utils';
import {
  ManageMembersComponent
} from "@modules/services/general-association-meeting-attendance/shared/manage-members/manage-members.component";
import {
  MeetingAgendaListComponent
} from "@modules/services/general-association-meeting-attendance/shared/meeting-agenda-list/meeting-agenda-list.component";
import {
  GeneralMeetingAttendanceNotesListComponent
} from "@modules/services/general-association-meeting-attendance/shared/general-meeting-attendance-notes-list/general-meeting-attendance-notes-list.component";

@Component({
  selector: 'general-association-meeting-attendance',
  templateUrl: './general-association-meeting-attendance.component.html',
  styleUrls: ['./general-association-meeting-attendance.component.scss']
})
export class GeneralAssociationMeetingAttendanceComponent extends EServicesGenericComponent<GeneralAssociationMeetingAttendance, GeneralAssociationMeetingAttendanceService> implements AfterViewInit {
  form!: FormGroup;
  oldModel!: GeneralAssociationMeetingAttendance;
  internalMembersForm!: FormGroup;
  private displayedColumns: string[] = ['fullSerial', 'status', 'requestTypeInfo', 'actions'];
  importFinalReport$: Subject<void> = new Subject<void>();

  selectedLicenses: GeneralAssociationMeetingAttendance[] = [];
  selectedLicenseDisplayedColumns: string[] = ['serial', 'requestType', 'licenseStatus'];
  hasSearchedForLicense = false;
  commonCaseStatus = CommonCaseStatus;
  isCancel: boolean = false;

  requestTypes: Lookup[] = this.lookupService.listByCategory.RequestTypeNewUpdate
    .sort((a, b) => a.lookupKey - b.lookupKey);
  meetingTypes: Lookup[] = this.lookupService.listByCategory.MeetingType
    .sort((a, b) => a.lookupKey - b.lookupKey);
  meetingClassifications: Lookup[] = this.lookupService.listByCategory.MeetingClassification
    .sort((a, b) => a.lookupKey - b.lookupKey);

  datepickerControlsMap: DatepickerControlsMap = {};
  datepickerOptionsMap!: DatepickerOptionsMap;

  isExternalUser!: boolean;
  selectedInternalUsers: GeneralAssociationInternalMember[] = [];
  oldSelectedInternalUsers: GeneralAssociationInternalMember[] = [];

  generalNotes: GeneralMeetingAttendanceNote[] = [];
  membersGeneralNotes: GeneralMeetingAttendanceNote[] = [];
  oldMembersGeneralNotes: GeneralMeetingAttendanceNote[] = [];

  userCommentsDisplayedColumns: string[] = ['index', 'arName', 'enName', 'status', 'actions'];
  meetingUserTaskStatus: MeetingMemberTaskStatus[] = [];
  oldMeetingUserTaskStatus: MeetingMemberTaskStatus[] = [];

  isMemberReview!: boolean;
  isDecisionMakerReview!: boolean;
  isDecisionMakerRework!: boolean;
  isManagerFinalReview!: boolean;
  memberId!: number;
  hoursList = DateUtils.getHoursList();
  generalAssociationMeetingRequestTypeEnum = GeneralAssociationMeetingRequestTypeEnum;

  // meeting points form
  meetingPointsForm!: UntypedFormGroup;
  finalReportFile: any;
  finalReportExtensions: string[] = ['.pdf', '.doc', '.docx'];
  viewFinalReport$: Subject<void> = new Subject<void>();
  @ViewChild('finalReportUploader') finalReportUploader!: ElementRef;

  meetingReport!: MeetingAttendanceReport;
  oldMeetingReport!: MeetingAttendanceReport;

  @ViewChild('manageMembersAdministrativeBoardMembers') administrativeBoardMembersRef!: ManageMembersComponent;
  @ViewChild('manageMembersGeneralAssociation') generalAssociationMembersRef!: ManageMembersComponent;
  @ViewChild('meetingAgendaListComponent') meetingAgendaListComponentRef!: MeetingAgendaListComponent;
  @ViewChild('generalNotesListComponent') generalNotesListComponentRef!: GeneralMeetingAttendanceNotesListComponent;

  tabsData: TabMap = {
    basicInfo: {
      name: 'basicInfo',
      langKey: 'lbl_basic_info',
      index: 0,
      validStatus: () => {
        return !!this.basicInfo && !this.basicInfo.invalid
      },
      isTouchedOrDirty: () => true
    },
    administrativeBoardMembers: {
      name: 'administrativeBoardMembers',
      langKey: 'administrative_board_members',
      index: 1,
      validStatus: () => {
        if (!this.administrativeBoardMembersRef) {
          return true;
        }
        return this.administrativeBoardMembersRef.list.length > 0;
      },
      isTouchedOrDirty: () => true
    },
    generalAssociationMembers: {
      name: 'generalAssociationMembers',
      langKey: 'general_association_members',
      index: 2,
      validStatus: () => {
        if (!this.generalAssociationMembersRef) {
          return true;
        }
        return this.generalAssociationMembersRef.list.length > 0;
      },
      isTouchedOrDirty: () => true
    },
    meetingAgenda: {
      name: 'meetingAgenda',
      langKey: 'meeting_agenda',
      index: 3,
      validStatus: () => {
        if (!this.meetingAgendaListComponentRef) {
          return true;
        }
        return this.meetingAgendaListComponentRef.list.length > 0;
      },
      isTouchedOrDirty: () => true
    },
    internalMembers: {
      name: 'internalMembers',
      langKey: 'internal_members',
      index: 4,
      validStatus: () => {
        if (this.isExternalUser) {
          return true;
        }
        return this.selectedInternalUsers && this.selectedInternalUsers.length > 0;
      },
      isTouchedOrDirty: () => true
    },
    meetingPoints: {
      name: 'meetingPoints',
      langKey: 'meeting_points',
      index: 5,
      validStatus: () => {
        return true;
      },
      isTouchedOrDirty: () => true
    },
    generalNotes: {
      name: 'generalNotes',
      langKey: 'general_notes',
      index: 6,
      validStatus: () => {
        return true;
      },
      isTouchedOrDirty: () => true
    },
    specialExplanations: {
      name: 'specialExplanations',
      langKey: 'special_explanations',
      index: 7,
      validStatus: () => {
        return !!this.specialExplanation && !this.specialExplanation.invalid;
      },
      isTouchedOrDirty: () => true
    },
    attachments: {
      name: 'attachments',
      langKey: 'attachments',
      index: 8,
      validStatus: () => true,
      isTouchedOrDirty: () => true
    }
  }

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

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }

  get basicInfo(): FormGroup {
    return this.form?.get('basicInfo')! as FormGroup;
  }

  get requestTypeField(): UntypedFormControl {
    return this.form?.get('basicInfo.requestType')! as UntypedFormControl;
  }

  get oldFullSerialField(): AbstractControl {
    return this.form?.get('basicInfo.oldFullSerial')!;
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

  get year(): FormControl {
    return this.form?.get('basicInfo.year')! as FormControl;
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

  _initComponent(): void {
    // load initials here
    this.isExternalUser = this.employeeService.isExternalUser();
    this.memberId = this.employeeService.getCurrentUser()?.generalUserId!;

    this.listenToImportFinalReport();
    // this.listenToDownloadFinalReport();
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
  }

  _afterBuildForm(): void {
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

    this.selectedInternalUsers = this.model?.internalMembersDTO;

    this.setDatePeriodValidation();
    this.handleRequestTypeChange(model.requestType, false);

    // update meeting form
    this.setMeetingPointsForm();

    this.isMemberReview = this.model?.isMemberReviewStep()!;
    this.isDecisionMakerRework = this.model?.isDecisionMakerReworkStep()!;
    this.isManagerFinalReview = this.model?.isManagerFinalReviewStep()!;
    this.isDecisionMakerReview = this.model?.isDecisionMakerReviewStep()!;

    if (this.isMemberReview || this.isDecisionMakerReview || this.isDecisionMakerRework) {
      let allGeneralMeetingNotesObs = this.service.getDecisionMakerMeetingGeneralNotes(this.memberId, this.model?.id);
      let specificGeneralMeetingNotesObs = this.service.getMeetingGeneralNotes(this.memberId, this.model?.id);
      if ((this.isDecisionMakerReview || this.isDecisionMakerRework) && this.model?.isSendToMember) {
        allGeneralMeetingNotesObs.subscribe(notes => {
          this.membersGeneralNotes = notes;
          this.generalNotes = notes;
        });
      }
      if (this.isMemberReview) {
        specificGeneralMeetingNotesObs.subscribe(notes => {
          this.generalNotes = notes.filter(n => n.finalComment !== 1);
        });
      }
    }

    if (this.model?.isSentToMember() && this.model?.isDecisionMakerReviewStep() || this.model?.isDecisionMakerReworkStep() || this.model?.isManagerFinalReviewStep()) {
      this.loadMembersTaskStatus();
    }

  }

  setMeetingPointsForm() {
    if ((this.model?.isDecisionMakerReviewStep() || this.model?.isDecisionMakerReworkStep()) && this.model?.isSendToMember && this.model?.isFinal) {
      let without: MeetingAttendanceReport;
      this.service.getFinalMeetingPointsForDecisionMaker(this.model?.id)
        .pipe(switchMap(meetingReportWithoutUserComment => {
          without = meetingReportWithoutUserComment;
          return this.service.getMeetingPointsForDecisionMaker(this.model?.id);
        }))
        .subscribe(meetingReport => {
          without.meetingMainItem.map(mainItem => {
            mainItem.meetingSubItem.forEach(subItem => {
              subItem.userComments = meetingReport.meetingMainItem.find(i => i.enName === mainItem.enName)!.meetingSubItem.find(si => si.enName === subItem.enName)!.userComments;
            });
            return mainItem;
          });
          if (without && without.meetingMainItem.length > 0) {
            // update meeting points form
            this.meetingReport = without;
            this.updateMeetingPointsForm(without);
          } else {
            this.buildMeetingPointsForm();
          }
        });
    }

    if (((this.model?.isDecisionMakerReviewStep() || this.model?.isDecisionMakerReworkStep()) && !this.model?.isSendToMember) ||
      ((this.model?.isDecisionMakerReviewStep() || this.model?.isDecisionMakerReworkStep()) && this.model?.isSendToMember && !this.model?.isFinal)) {
      this.service.getMeetingPointsForDecisionMaker(this.model?.id).subscribe(meetingReport => {
        if (meetingReport && meetingReport.meetingMainItem.length > 0) {
          // update meeting points form
          this.meetingReport = meetingReport;
          this.updateMeetingPointsForm(meetingReport);
        } else {
          this.buildMeetingPointsForm();
        }
      });
    }

    if (this.model?.isMemberReviewStep()) {
      this.service.getMeetingPointsForMember(this.model?.id).subscribe(meetingReport => {
        // filter out the final comments created by decision maker
        meetingReport.meetingMainItem = meetingReport.meetingMainItem.filter(mainItem => mainItem.finalItem !== 1);
        meetingReport.meetingMainItem = meetingReport.meetingMainItem.map(mainItem => {
          mainItem.meetingSubItem = mainItem.meetingSubItem.filter(subItem => subItem.finalItem !== 1);
          return mainItem;
        });

        if (this.isMemberReview || (this.isDecisionMakerReview && meetingReport && meetingReport.meetingMainItem.length > 0)) {
          // get meeting attendance report
          this.updateMeetingPointsForm(meetingReport);
          // update meeting points form
        } else {
          this.buildMeetingPointsForm();
        }
      });
    }
    if (this.model?.isDecisionMakerReviewStep() || this.model?.isDecisionMakerReworkStep()) {
      this.licenseService
        .generalAssociationMeetingAttendanceSearch<GeneralAssociationMeetingAttendance>({
          fullSerial: this.oldFullSerialField.value,
          caseStatus: this.commonCaseStatus.CANCELLED
        })
        .pipe(takeUntil(this.destroy$))
        .pipe(map((licenses) => {
          return licenses[0];
        })).subscribe((license) => {
        this.oldModel = license;
        this.service.getMeetingPointsForDecisionMaker(license.id).subscribe(meetingReport => {
          this.oldMeetingReport = meetingReport;
        });

        let allGeneralMeetingNotesObs = this.service.getDecisionMakerMeetingGeneralNotes(this.memberId, license?.id);
        allGeneralMeetingNotesObs.subscribe(notes => {
          this.oldMembersGeneralNotes = notes;
        });
        this.oldSelectedInternalUsers = license?.internalMembersDTO;

        this.service.getMemberTaskStatus(license?.id).subscribe(membersStatus => {
          this.oldMeetingUserTaskStatus = [...membersStatus.map(x => new MeetingMemberTaskStatus().clone(x)).slice()];
          this.oldSelectedInternalUsers = this.oldSelectedInternalUsers.map(user => {
            user.pId = this.oldMeetingUserTaskStatus.find(u => u.arName === user.arabicName && u.enName === user.englishName)!.pId;
            user.name = this.oldMeetingUserTaskStatus.find(u => u.arName === user.arabicName && u.enName === user.englishName)!.name;
            user.tkiid = this.oldMeetingUserTaskStatus.find(u => u.arName === user.arabicName && u.enName === user.englishName)!.tkiid;
            user.userId = this.oldMeetingUserTaskStatus.find(u => u.arName === user.arabicName && u.enName === user.englishName)!.userId;
            return user;
          });
        });
      });
    }
  }

  isUpdateRequest() {
    return this.requestTypeField.value == GeneralAssociationMeetingRequestTypeEnum.UPDATE;
  }

  private setDatePeriodValidation() {
    if (this.operation === OperationTypes.CREATE || this.model?.caseStatus === this.commonCaseStatus.DRAFT || this.model?.caseStatus === this.commonCaseStatus.NEW || this.model?.isCharityManagerReviewStep() || this.model?.isSupervisionAndControlReviewStep() || this.model?.isSupervisionManagerReviewStep() || this.model?.isSupervisionAndControlReworkStep()) {
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
    this.administrativeBoardMembersRef?.forceClearComponent();
    this.generalAssociationMembersRef?.forceClearComponent();
    this.meetingAgendaListComponentRef?.forceClearComponent();
    this.hasSearchedForLicense = false;
  }

  _prepareModel(): GeneralAssociationMeetingAttendance | Observable<GeneralAssociationMeetingAttendance> {
    return new GeneralAssociationMeetingAttendance().clone({
      ...this.model,
      ...this.basicInfo.getRawValue(),
      ...this.specialExplanation.getRawValue(),
      administrativeBoardMembers: this.administrativeBoardMembersRef?.list ?? [],
      generalAssociationMembers: this.generalAssociationMembersRef?.list ?? [],
      internalMembersDTO: this.selectedInternalUsers,
      agendaList: this.meetingAgendaListComponentRef?.list ?? []
    });
  }

  _getNewInstance(): GeneralAssociationMeetingAttendance {
    return new GeneralAssociationMeetingAttendance();
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (saveType === SaveTypes.DRAFT) {
      if (this.requestTypeField.value) {
        return true;
      }
    } else {
      if (this.administrativeBoardMembersRef && this.administrativeBoardMembersRef.list.length < 1) {
        this.dialog.error(this.lang.map.you_should_add_at_least_one_person_to_administrative_board_members);
        return false;
      }

      if (this.generalAssociationMembersRef && this.generalAssociationMembersRef.list.length < 1) {
        this.dialog.error(this.lang.map.you_should_add_at_least_one_person_to_general_association_members);
        return false;
      }

      if (this.meetingAgendaListComponentRef && this.meetingAgendaListComponentRef.list.length < 1) {
        this.dialog.error(this.lang.map.you_should_add_at_least_one_item_to_meeting_agenda);
        return false;
      }

      if (this.isSupervisionAndControlReviewStep && this.selectedInternalUsers && this.selectedInternalUsers.length < 1) {
        this.dialog.error(this.lang.map.you_should_add_at_least_one_member_to_internal_users);
        return false;
      }
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
    this.resetForm$.next();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }

  _launchFail(error: any): void {

  }

  _destroyComponent(): void {

  }

  ngAfterViewInit(): void {
    this.cd.detectChanges();
  }

  handleRequestTypeChange(requestTypeValue: number, userInteraction: boolean = false): void {
    of(userInteraction).pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.confirmChangeRequestType(userInteraction))
    ).subscribe((clickOn: UserClickOn) => {
      if (clickOn === UserClickOn.YES) {
        if (userInteraction) {
          this.resetForm$.next();
          this.requestTypeField.setValue(requestTypeValue);
        }
        if (!requestTypeValue || requestTypeValue === GeneralAssociationMeetingRequestTypeEnum.NEW) {
          this.enableAllFormsInCaseOfNotCancelRequest();
          this.disableSearchField();
          this.isCancel = false;
        } else if (requestTypeValue === GeneralAssociationMeetingRequestTypeEnum.UPDATE) {
          this.enableAllFormsInCaseOfNotCancelRequest();
          this.enableSearchField();
          this.isCancel = false;
        } else {
          this.disableAllFormsInCaseOfCancelRequest();
          this.enableSearchField();
          this.isCancel = true;
        }

        this.requestType$.next(requestTypeValue);
      } else {
        this.requestTypeField.setValue(this.requestType$.value);
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
    this.oldFullSerialField.enable();
    this.setOldLicenseFullSerialRequired();
  }

  disableSearchField() {
    this.oldFullSerialField.patchValue(null);
    this.oldFullSerialField.disable();
    this.oldFullSerialField.setValidators([]);
    this.oldFullSerialField.updateValueAndValidity();
  }

  setOldLicenseFullSerialRequired() {
    this.oldFullSerialField.setValidators([CustomValidators.required, CustomValidators.maxLength(50)]);
    this.oldFullSerialField.updateValueAndValidity();
  }

  private _buildDatepickerControlsMap() {
    this.datepickerControlsMap = {
      meetingDate: this.meetingDate
    };
  }

  private validateSingleLicense(license: GeneralAssociationMeetingAttendance): Observable<null | SelectedLicenseInfo<GeneralAssociationMeetingAttendance, GeneralAssociationMeetingAttendance>> {
    return this.service.validateLicenseByRequestType(this.model!.requestType, license.fullSerial)
      .pipe(map(validated => {
        return (validated ? {
          selected: validated,
          details: validated
        } : null) as (null | SelectedLicenseInfo<GeneralAssociationMeetingAttendance, GeneralAssociationMeetingAttendance>);
      }));
  }

  private openSelectLicense(licenses: GeneralAssociationMeetingAttendance[]) {
    return this.licenseService.openSelectLicenseDialog(licenses, this.model, true, this.displayedColumns, this.oldFullSerialField.value, true).onAfterClose$ as Observable<{
      selected: GeneralAssociationMeetingAttendance,
      details: GeneralAssociationMeetingAttendance
    }>;
  }

  searchForLicense() {
    this.licenseService
      .generalAssociationMeetingAttendanceSearch<GeneralAssociationMeetingAttendance>({fullSerial: this.oldFullSerialField.value})
      .pipe(takeUntil(this.destroy$))
      .pipe(map(licenses =>
        licenses.filter((l: GeneralAssociationMeetingAttendance) => l.caseStatus == CommonCaseStatus.INITIAL_APPROVE)))
      .pipe(tap(licenses => !licenses.length && this.dialog.info(this.lang.map.no_result_for_your_search_criteria)))
      .pipe(filter(licenses => !!licenses.length))
      .pipe(exhaustMap((licenses) => {
        return licenses.length === 1 ? this.validateSingleLicense(licenses[0]) : this.openSelectLicense(licenses);
      }))
      .pipe(
        filter<null | SelectedLicenseInfo<GeneralAssociationMeetingAttendance, GeneralAssociationMeetingAttendance>, SelectedLicenseInfo<GeneralAssociationMeetingAttendance, GeneralAssociationMeetingAttendance>>
        ((info): info is SelectedLicenseInfo<GeneralAssociationMeetingAttendance, GeneralAssociationMeetingAttendance> => !!info))
      .subscribe((_info) => {
        this.setSelectedLicense(_info.details)
      });
  }

  private setSelectedLicense(licenseDetails: GeneralAssociationMeetingAttendance) {
    this.selectedLicenses = [licenseDetails];
    if (licenseDetails) {
      let requestType = this.requestTypeField?.value,
        result: Partial<GeneralAssociationMeetingAttendance> = {
          requestType
        };
      this.hasSearchedForLicense = true;

      result.oldFullSerial = licenseDetails.fullSerial;
      result.npoApproved = false;
      result.isSendToMember = false;
      result.followUpDate = licenseDetails.followUpDate;

      result.agenda = licenseDetails.agenda;
      result.description = licenseDetails.description;
      result.location = licenseDetails.location;
      result.meetingClassification = licenseDetails.meetingClassification;
      result.meetingDate = licenseDetails.meetingDate;
      result.meetingInitiator = licenseDetails.meetingInitiator;
      result.meetingTime = licenseDetails.meetingTime;
      result.meetingType = licenseDetails.meetingType;
      result.periodical = licenseDetails.periodical;
      result.year = licenseDetails.year;

      result.meetingClassificationInfo = licenseDetails.meetingClassificationInfo;
      result.meetingTypeInfo = licenseDetails.meetingTypeInfo;

      result.generalAssociationMembers = licenseDetails.generalAssociationMembers;
      result.administrativeBoardMembers = licenseDetails.administrativeBoardMembers;
      result.internalMembersDTO = licenseDetails.internalMembersDTO;

      result.meetingReportID = licenseDetails.meetingReportID;

      result.specialistDecision = licenseDetails.specialistDecision;
      result.specialistDecisionInfo = licenseDetails.specialistDecisionInfo;

      result.managerDecision = licenseDetails.managerDecision;
      result.managerDecisionInfo = licenseDetails.managerDecisionInfo;

      result.managerJustification = licenseDetails.managerJustification;
      result.specialistJustification = licenseDetails.specialistJustification;

      result.organizationId = licenseDetails.organizationId;

      this._updateForm((new GeneralAssociationMeetingAttendance()).clone(result));
    }
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

  onInternalMembersChanged(memberList: GeneralAssociationInternalMember[]) {
    this.selectedInternalUsers = memberList;
  }

  handleReadonly(): void {
    // if record is new, no readonly (don't change as default is readonly = false)
    if (!this.model?.id) {
      return;
    }

    let caseStatus = this.model.getCaseStatus();
    if (caseStatus == CommonCaseStatus.FINAL_APPROVE || caseStatus === CommonCaseStatus.FINAL_REJECTION || caseStatus === CommonCaseStatus.CANCELLED) {
      this.readonly = true;
      return;
    }

    if (this.openFrom === OpenFrom.USER_INBOX) {
      if (this.employeeService.isCharityManager()) {
        this.readonly = this.model.isInitialApproved();
      } else if (this.employeeService.isCharityUser()) {
        this.readonly = this.model.isInitialApproved() ? true : !this.model.isReturned();
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

  canUpdateMeetingDate() {
    return this.model?.caseStatus != CommonCaseStatus.CANCELLED && this.model?.taskDetails?.isClaimed() && (this.isSupervisionAndControlReviewStep || this.isSupervisionManagerReviewStep || this.isSupervisionAndControlRework);
  }

  getMeetingDateClass() {
    if (this.readonly && this.canUpdateMeetingDate()) {
      return {'input-disabled': false};
    } else if (this.readonly || this.isCancel) {
      return {'input-disabled': true};
    } else {
      return {'input-disabled': false};
    }
  }

  get isSupervisionAndControlReviewStep(): boolean {
    return this.model?.isSupervisionAndControlReviewStep()!;
  }

  get isSupervisionManagerReviewStep(): boolean {
    return this.model?.isSupervisionManagerReviewStep()!;
  }

  get isSupervisionAndControlRework(): boolean {
    return this.model?.isSupervisionAndControlReworkStep()!;
  }

  // meeting points functionality
  initMeetingPointsForm(): void {
    this.meetingPointsForm = this.fb.group({
      meetingMainItem: this.fb.array([])
    });
  }

  buildMeetingPointsForm(): void {
    this.meetingPointsForm = this.fb.group({
      meetingMainItem: this.fb.array([])
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
      addedByDecisionMaker: [mainItem.addedByDecisionMaker],
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
    return subItem.get('userComments')?.value.map((x: MeetingPointMemberComment) => {
      return new MeetingPointMemberComment().clone(x);
    });
  }

  newSubItem(subItem: MeetingAttendanceSubItem = new MeetingAttendanceSubItem()): FormGroup {
    return this.fb.group({
      id: [subItem.id],
      enName: [subItem.enName, [CustomValidators.required, CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]],
      comment: [subItem.comment, this.isMemberReview || (this.isDecisionMakerReview && this.model?.isSendToMember) ? [CustomValidators.required, CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)] : []],
      respectTerms: [((this.isDecisionMakerReview || this.isDecisionMakerRework) && this.model?.isSendToMember && !CommonUtils.isValidValue(subItem?.comment)) ? this.autoCheckRespectTerms(subItem.userComments!) : subItem.respectTerms, []],
      mainItemID: [subItem.mainItemID],
      memberID: [subItem.memberID],
      addedByDecisionMaker: [subItem.addedByDecisionMaker],
      status: [subItem.status],
      userComments: [subItem.userComments],
      selected: []
    });
  }

  autoCheckRespectTerms(userComments: MeetingPointMemberComment[]) {
    let respectTerms;
    if (userComments.length === 0) {
      respectTerms = 0;
      return respectTerms;
    }

    let respectTermsSum = userComments.reduce((accumulator, comment) => {
      return accumulator + comment.respectTerms;
    }, 0);

    if (respectTermsSum >= (userComments.length / 2)) {
      respectTerms = 1;
    } else {
      respectTerms = 0;
    }

    return respectTerms;
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

  getViewSubItemClass() {
    if (this.lang.map.lang === 'en') {
      return {'view-sub-item-right': true, 'view-sub-item-left': false};
    } else {
      return {'view-sub-item-right': false, 'view-sub-item-left': true};
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

  saveFinalMeetingPoints() {
    const model = new MeetingAttendanceReport().clone(this.meetingPointsForm.value);
    this.service.addFinalMeetingPoints(model, this.model?.id).subscribe(ret => {
      if (ret) {
        this.updateMeetingPointsForm(ret);
        this.dialog.success(this.lang.map.final_comments_saved_successfully);
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

  terminateUserTask(item: MeetingMemberTaskStatus) {
    this.service.terminateMemberTask(item.tkiid).subscribe(_ => {
      this.dialog.success(this.lang.map.member_task_terminated_successfully);
      this.loadMembersTaskStatus();
    });
  }

  loadMembersTaskStatus() {
    this.service.getMemberTaskStatus(this.model?.id).subscribe(membersStatus => {
      this.meetingUserTaskStatus = [...membersStatus.map(x => new MeetingMemberTaskStatus().clone(x)).slice()];
      this.selectedInternalUsers = this.selectedInternalUsers.map(user => {
        user.pId = this.meetingUserTaskStatus.find(u => u.arName === user.arabicName && u.enName === user.englishName)!.pId;
        user.name = this.meetingUserTaskStatus.find(u => u.arName === user.arabicName && u.enName === user.englishName)!.name;
        user.tkiid = this.meetingUserTaskStatus.find(u => u.arName === user.arabicName && u.enName === user.englishName)!.tkiid;
        user.userId = this.meetingUserTaskStatus.find(u => u.arName === user.arabicName && u.enName === user.englishName)!.userId;
        return user;
      });
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

  // listenToDownloadFinalReport() {
  //   this.viewFinalReport$.pipe(
  //     takeUntil(this.destroy$),
  //     switchMap(() => {
  //       return this.model?.downloadFinalReport()!;
  //     })
  //   ).subscribe(blob => {
  //     window.open(blob.url);
  //   });
  // }

  meetingDateChanged(event: any) {
    this.year.patchValue((new Date(DateUtils.getDateStringFromDate(event))).getFullYear());
  }

  canRemoveMeetingPoint(point: any) {
    let isSelfMadePoint = +point.get('addedByDecisionMaker').value !== 1;
    return this.model?.canRemoveMeetingPoints(isSelfMadePoint);
  }

  canEditMeetingPoints(point: any) {
    let isSelfMadePoint = +point.get('addedByDecisionMaker').value !== 1;
    return this.model?.canEditSelfMadeMeetingPoints(isSelfMadePoint);
  }
}
