import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, UntypedFormControl } from '@angular/forms';
import { DialogService } from '@services/dialog.service';
import { LangService } from '@services/lang.service';
import { GeneralAssociationMeetingAttendanceService } from '@services/general-association-meeting-attendance.service';
import { CustomValidators } from '@app/validators/custom-validators';
import { Observable, of } from 'rxjs';
import { exhaustMap, filter, map, tap } from 'rxjs/operators';
import { GeneralAssociationInternalMember } from '@models/general-association-internal-member';
import { InternalUserService } from '@services/internal-user.service';
import { GeneralAssociationInternalMemberTypeEnum } from '@enums/general-association-internal-member-type-enum';
import { InternalUser } from '@models/internal-user';
import { GeneralAssociationMeetingAttendance } from '@models/general-association-meeting-attendance';
import { CommonCaseStatus } from '@enums/common-case-status.enum';
import { GeneralAssociationMeetingStepNameEnum } from '@enums/general-association-meeting-step-name-enum';
import { MeetingMemberTaskStatus } from '@models/meeting-member-task-status';
import { MeetingAttendanceReport } from '@models/meeting-attendance-report';
import { GeneralMeetingAttendanceNote } from '@models/general-meeting-attendance-note';
import { GeneralMeetingsMemberStatus } from '@app/interfaces/general-meetings-member-status';
import { ActionIconsEnum } from "@enums/action-icons-enum";
import { UserClickOn } from "@enums/user-click-on.enum";
import { ToastService } from "@services/toast.service";

@Component({
  selector: 'manage-internal-users',
  templateUrl: './manage-internal-users.component.html',
  styleUrls: ['./manage-internal-users.component.scss']
})
export class ManageInternalUsersComponent implements OnInit {
  @Input() internalMembersForm!: FormGroup;
  @Input() isExternalUser!: boolean;
  @Input() isCancel!: boolean;
  @Input() caseStepName!: string;
  @Input() model!: GeneralAssociationMeetingAttendance;
  @Input() selectedInternalUsers: GeneralAssociationInternalMember[] = [];
  @Output() memberListChanged: EventEmitter<GeneralAssociationInternalMember[]> = new EventEmitter<GeneralAssociationInternalMember[]>();
  @Output() userTaskTerminated: EventEmitter<MeetingMemberTaskStatus> = new EventEmitter<MeetingMemberTaskStatus>();
  _isClaimed!: boolean;
  @Input() set isClaimed(value: boolean) {
    this._isClaimed = value;
    this.setReadonly();
  };

  get isClaimed(): boolean {
    return this._isClaimed;
  }

  readonly!: boolean;
  showForm!: boolean;
  actionIconsEnum = ActionIconsEnum;

  selectedInternalUser!: GeneralAssociationInternalMember | null;
  selectedInternalUserIndex!: number | null;

  membersDisplayedColumns: string[] = ['index', 'arabicName', 'englishName', 'isDecisionMaker', 'status', 'actions'];
  internalUserType = GeneralAssociationInternalMemberTypeEnum;
  @Input() meetingReport!: MeetingAttendanceReport;
  @Input() generalNotes: GeneralMeetingAttendanceNote[] = [];

  filterControl: UntypedFormControl = new UntypedFormControl('');

  constructor(private dialog: DialogService,
    public lang: LangService,
    private fb: FormBuilder,
    private toast: ToastService,
    private generalAssociationMeetingService: GeneralAssociationMeetingAttendanceService,
    private internalUserService: InternalUserService) {
  }

  get allowAddMember(): boolean {
    return !this.readonly && !this.isExternalUser
      && (this.isSupervisionAndControlTeamReview() ||
        this.isSupervisionAndControlReview() ||
        this.isSupervisionAndControlRework() ||
        this.isSupervisionManagerReview() ||
        this.isSupervisionAndControlTeamRework())
  }

  get arabicName(): FormControl {
    return this.internalMembersForm.get('arabicName')! as FormControl;
  }

  get englishName(): FormControl {
    return this.internalMembersForm.get('englishName')! as FormControl;
  }

  get qid(): FormControl {
    return this.internalMembersForm.get('qid')! as FormControl;
  }

  ngOnInit(): void {
    this.buildMemberForm();
    this.setReadonly();
    this.setDisplayedColumns();
  }

  setDisplayedColumns() {
    if (!this.isExternalUser && this.model?.isSentToMember() && (this.model?.isDecisionMakerReviewStep() || this.model?.isDecisionMakerReworkStep()) || this.model?.isManagerFinalReviewStep()) {
      this.membersDisplayedColumns = ['index', 'arabicName', 'englishName', 'isDecisionMaker', 'status', 'actions'];
    } else {
      this.membersDisplayedColumns = ['index', 'arabicName', 'englishName', 'isDecisionMaker', 'actions'];
    }
  }

  setReadonly() {
    this.readonly = !this.isClaimed || this.isCancel ||
      !(
        this.isSupervisionAndControlReview() ||
        this.isSupervisionManagerReview() ||
        this.isSupervisionAndControlRework() ||
        this.isSupervisionAndControlTeamRework() ||
        this.isSupervisionAndControlTeamReview()) ||
      (this.model?.getCaseStatus() !== CommonCaseStatus.UNDER_PROCESSING && this.model?.getCaseStatus() !== CommonCaseStatus.RETURNED);
  }

  /*!model?.taskDetails?.isClaimed() || isCancel ||
  !(isSupervisionAndControlReviewStep || isSupervisionManagerReviewStep || isSupervisionAndControlRework) ||
  (model?.getCaseStatus() !== commonCaseStatus.UNDER_PROCESSING && model?.getCaseStatus() !== commonCaseStatus.RETURNED)*/

  buildMemberForm(): void {
    this.internalMembersForm = this.fb.group({
      arabicName: [null, [CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX), CustomValidators.pattern('AR_NUM')]],
      englishName: [null, [CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.pattern('ENG_NUM')]],
      qid: [null, [CustomValidators.maxLength(50)]],
    });
  }

  openAddAdministrativeBoardMemberForm() {
    this.showForm = true;
  }

  selectMember(event: MouseEvent, model: GeneralAssociationInternalMember) {
    this.showForm = true;
    event.preventDefault();
    this.selectedInternalUser = model;
    this.internalMembersForm.patchValue(this.selectedInternalUser!);
    this.selectedInternalUserIndex = this.selectedInternalUsers
      .map(x => x.id).indexOf(model.id);
  }

  _saveMember(internalUser: GeneralAssociationInternalMember) {
    if (!this.selectedInternalUser) {
      if (!this.isExistMemberInCaseOfAdd(this.selectedInternalUsers, internalUser)) {
        if (this.selectedInternalUsers.length === 0) {
          internalUser.memberType = this.internalUserType.IS_DECISION_MAKER;
        } else {
          internalUser.memberType = this.internalUserType.IS_NOT_DECISION_MAKER;
        }
        this.selectedInternalUsers = this.selectedInternalUsers.concat(internalUser);
        this.resetMemberForm();
        this.showForm = false;
        this.memberListChanged.emit(this.selectedInternalUsers);
        this.toast.success(this.lang.map.msg_added_in_list_success);
      } else {
        this.dialog.error(this.lang.map.selected_item_already_exists);
      }
    } else {
      if (!this.isExistMemberInCaseOfEdit(this.selectedInternalUsers, internalUser, this.selectedInternalUserIndex!)) {
        let newList = this.selectedInternalUsers.slice();
        newList.splice(this.selectedInternalUserIndex!, 1);
        newList.splice(this.selectedInternalUserIndex!, 0, internalUser);
        this.selectedInternalUsers = newList;
        this.resetMemberForm();
        this.showForm = false;
        this.memberListChanged.emit(this.selectedInternalUsers);
        this.toast.success(this.lang.map.msg_updated_in_list_success);
      } else {
        this.dialog.error(this.lang.map.selected_item_already_exists);
      }
    }
  }

  isTerminatedMember(row: GeneralAssociationInternalMember) {
    return row.name == GeneralMeetingsMemberStatus.terminated
  }

  saveMember() {
    const boardMember = new GeneralAssociationInternalMember().clone(this.internalMembersForm.getRawValue());

    this._saveMember(boardMember);
  }

  cancelAddMember() {
    this.resetMemberForm();
    this.showForm = false;
  }

  resetMemberForm() {
    this.selectedInternalUser = null;
    this.selectedInternalUserIndex = null;
    this.internalMembersForm.reset();
  }

  removeMember(event: MouseEvent, model: GeneralAssociationInternalMember) {
    event.preventDefault();
    if (model.memberType === this.internalUserType.IS_DECISION_MAKER && this.selectedInternalUsers.length > 1) {
      this.dialog.error(this.lang.map.can_not_delete_the_decision_maker);
      return;
    }

    this.dialog.confirm(this.lang.map.msg_confirm_delete_x.change({ x: model.getName() }))
      .onAfterClose$.subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          this.selectedInternalUsers = this.selectedInternalUsers.filter(x => x.domainName != model.domainName);
          this.resetMemberForm();
          this.memberListChanged.emit(this.selectedInternalUsers);
          this.toast.success(this.lang.map.msg_deleted_in_list_success);
        }
      });
  }

  viewMemberCommentsAndNotes(event: MouseEvent, model: GeneralAssociationInternalMember) {
    event.preventDefault();
    this.generalAssociationMeetingService.openViewMemberCommentsAndNotesDialog(model, this.meetingReport, this.generalNotes, model.userId, this.model?.id);
  }

  isExistMemberInCaseOfAdd(selectedMembers: GeneralAssociationInternalMember[], toBeAddedMember: GeneralAssociationInternalMember): boolean {
    return selectedMembers.some(x => x.domainName === toBeAddedMember.domainName);
  }

  isExistMemberInCaseOfEdit(selectedMembers: GeneralAssociationInternalMember[], toBeEditedMember: GeneralAssociationInternalMember, selectedIndex: number): boolean {
    for (let i = 0; i < selectedMembers.length; i++) {
      if (i === selectedIndex) {
        continue;
      }

      if (selectedMembers[i].domainName === toBeEditedMember.domainName) {
        return true;
      }
    }
    return false;
  }

  private openSelectMember(members: GeneralAssociationInternalMember[]) {
    return this.generalAssociationMeetingService.openSelectMemberDialog(members, true, true).onAfterClose$ as Observable<GeneralAssociationInternalMember>;
  }

  searchMembers() {
    const criteria = {
      arabicName: this.arabicName.value === '' ? null : this.arabicName.value,
      englishName: this.englishName.value === '' ? null : this.englishName.value,
      identificationNumber: this.qid.value === '' ? null : this.qid.value,
    };
    this.internalUserService.searchByArabicOrEnglishName(criteria)
      .pipe(tap(members => !members.length && this.dialog.info(this.lang.map.no_result_for_your_search_criteria)))
      .pipe(filter(members => !!members.length))
      .pipe(map(items => {
        return items.map(item => new GeneralAssociationInternalMember().clone(this.mapInternalUserToGeneralAssociationInternalMember(item)));
      }))
      .pipe(exhaustMap((members) => {
        return members.length === 1 ? of(members[0]) : this.openSelectMember(members);
      }))
      .pipe(filter(item => !!item))
      .subscribe((item) => {
        this._saveMember(item);
      });
  }

  mapInternalUserToGeneralAssociationInternalMember(generalAssociationInternalMember: InternalUser) {
    const member = new GeneralAssociationInternalMember();
    member.id = generalAssociationInternalMember.id;
    member.arabicName = generalAssociationInternalMember.arName;
    member.englishName = generalAssociationInternalMember.enName;
    member.domainName = generalAssociationInternalMember.domainName;

    return member;
  }

  makeDecisionMaker(generalAssociationInternalMember: GeneralAssociationInternalMember): void {
    this.selectedInternalUsers.filter(u => u.memberType === GeneralAssociationInternalMemberTypeEnum.IS_DECISION_MAKER).forEach(u => u.memberType = GeneralAssociationInternalMemberTypeEnum.IS_NOT_DECISION_MAKER);
    this.selectedInternalUsers.find(u => u.domainName === generalAssociationInternalMember.domainName)!.memberType = GeneralAssociationInternalMemberTypeEnum.IS_DECISION_MAKER;
  }

  isUnderProcessingLicense() {
    return this.model.getCaseStatus() === CommonCaseStatus.UNDER_PROCESSING;
  }

  isSupervisionAndControlReview() {
    return this.caseStepName === GeneralAssociationMeetingStepNameEnum.SUPERVISION_AND_CONTROL_REVIEW;
  }

  isSupervisionAndControlRework() {
    return this.caseStepName === GeneralAssociationMeetingStepNameEnum.SUPERVISION_AND_CONTROL_REWORK;
  }

  isSupervisionManagerReview() {
    return this.caseStepName === GeneralAssociationMeetingStepNameEnum.SUPERVISION_MANAGER_REVIEW;
  }
  isSupervisionAndControlTeamReview() {
    return this.caseStepName === GeneralAssociationMeetingStepNameEnum.SupervisionAndControlTeamReview;
  }
  isSupervisionAndControlTeamRework() {
    return this.caseStepName === GeneralAssociationMeetingStepNameEnum.SupervisionAndControlTeamRework;
  }
  terminateUserTask($event: MouseEvent, item: MeetingMemberTaskStatus) {
    $event.preventDefault();
    this.userTaskTerminated.emit(item);
  }
}
