import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {DialogService} from '@services/dialog.service';
import {LangService} from '@services/lang.service';
import {GeneralAssociationMeetingAttendanceService} from '@services/general-association-meeting-attendance.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {Observable, of} from 'rxjs';
import {exhaustMap, filter, map, tap} from 'rxjs/operators';
import {GeneralAssociationInternalMember} from '@app/models/general-association-internal-member';
import {InternalUserService} from '@services/internal-user.service';
import {GeneralAssociationInternalMemberTypeEnum} from '@app/enums/general-association-internal-member-type-enum';
import {InternalUser} from '@app/models/internal-user';
import {EmployeeService} from '@services/employee.service';
import {GeneralAssociationMeetingAttendance} from '@app/models/general-association-meeting-attendance';
import {CommonCaseStatus} from '@app/enums/common-case-status.enum';

@Component({
  selector: 'manage-internal-users',
  templateUrl: './manage-internal-users.component.html',
  styleUrls: ['./manage-internal-users.component.scss']
})
export class ManageInternalUsersComponent implements OnInit {
  @Input() internalMembersForm!: FormGroup;
  @Input() isExternalUser!: boolean;
  @Input() readonly!: boolean;
  @Input() model!: GeneralAssociationMeetingAttendance;
  @Input() selectedInternalUsers: GeneralAssociationInternalMember[] = [];
  @Output() memberListChanged: EventEmitter<GeneralAssociationInternalMember[]> = new EventEmitter<GeneralAssociationInternalMember[]>();

  addMemberFormActive!: boolean;

  selectedInternalUser!: GeneralAssociationInternalMember | null;
  selectedInternalUserIndex!: number | null;

  membersDisplayedColumns: string[] = ['index', 'arabicName', 'englishName', 'isDecisionMaker', 'actions'];
  internalUserType = GeneralAssociationInternalMemberTypeEnum;

  constructor(private dialog: DialogService,
              public lang: LangService,
              private fb: FormBuilder,
              private generalAssociationMeetingService: GeneralAssociationMeetingAttendanceService,
              private internalUserService: InternalUserService,
              private employeeService: EmployeeService) {

  }

  get arabicName(): FormControl {
    return this.internalMembersForm.get('arabicName')! as FormControl;
  }

  get englishName(): FormControl {
    return this.internalMembersForm.get('englishName')! as FormControl;
  }

  ngOnInit(): void {
    this.buildMemberForm();
  }

  buildMemberForm(): void {
    this.internalMembersForm = this.fb.group({
      arabicName: [null, [CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX), CustomValidators.pattern('AR_NUM')]],
      englishName: [null, [CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.pattern('ENG_NUM')]]
    });
  }

  openAddAdministrativeBoardMemberForm() {
    this.addMemberFormActive = true;
  }

  selectMember(event: MouseEvent, model: GeneralAssociationInternalMember) {
    this.addMemberFormActive = true;
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
        this.addMemberFormActive = false;
        this.memberListChanged.emit(this.selectedInternalUsers);
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
        this.addMemberFormActive = false;
        this.memberListChanged.emit(this.selectedInternalUsers);
      } else {
        this.dialog.error(this.lang.map.selected_item_already_exists);
      }
    }
  }

  saveMember() {
    const boardMember = new GeneralAssociationInternalMember().clone(this.internalMembersForm.getRawValue());

    this._saveMember(boardMember);
  }

  cancelAddMember() {
    this.resetMemberForm();
    this.addMemberFormActive = false;
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
    this.selectedInternalUsers = this.selectedInternalUsers.filter(x => x.domainName != model.domainName);
    this.resetMemberForm();
    this.memberListChanged.emit(this.selectedInternalUsers);
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
      englishName: this.englishName.value === '' ? null : this.englishName.value
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
    this.selectedInternalUsers.filter(u => u.memberType === this.internalUserType.IS_DECISION_MAKER).forEach(u => u.memberType = this.internalUserType.IS_NOT_DECISION_MAKER);
    this.selectedInternalUsers.find(u => u.id === generalAssociationInternalMember.id)!.memberType = this.internalUserType.IS_DECISION_MAKER;
  }

  get isSupervisionAndControlManager(): boolean {
    return this.employeeService.isSupervisionAndControlManager();
  }

  get isSupervisionAndControlSecretary(): boolean {
    return this.employeeService.isSupervisionAndControlSecretary();
  }

  get isUnderProcessingLicense() {
    return this.model.getCaseStatus() === CommonCaseStatus.UNDER_PROCESSING;
  }
}
