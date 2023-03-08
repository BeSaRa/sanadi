import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {GeneralAssociationExternalMember} from '@models/general-association-external-member';
import {DialogService} from '@services/dialog.service';
import {LangService} from '@services/lang.service';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {JobTitle} from '@models/job-title';
import {JobTitleService} from '@services/job-title.service';
import {AdminResult} from '@models/admin-result';
import {CustomValidators} from '@app/validators/custom-validators';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {exhaustMap, filter, map, tap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {GeneralAssociationMeetingAttendanceService} from '@services/general-association-meeting-attendance.service';
import {NpoEmployee} from '@models/npo-employee';

@Component({
  selector: 'manage-members',
  templateUrl: './manage-members.component.html',
  styleUrls: ['./manage-members.component.scss']
})
export class ManageMembersComponent implements OnInit {
  membersForm!: FormGroup;
  @Input() isExternalUser!: boolean;
  @Input() isGeneralAssociationMembers!: boolean;
  @Input() readonly !: boolean;
  @Input() selectedMembers: GeneralAssociationExternalMember[] = [];
  @Input() addLabel!: keyof ILanguageKeys;
  @Output() memberListChanged: EventEmitter<GeneralAssociationExternalMember[]> = new EventEmitter<GeneralAssociationExternalMember[]>();

  addMemberFormActive!: boolean;

  selectedMember!: GeneralAssociationExternalMember | null;
  selectedMemberIndex!: number | null;
  jobTitles!: JobTitle[];

  membersDisplayedColumns: string[] = ['index', 'arabicName', 'englishName', 'identificationNumber', 'jobTitle', 'actions'];

  constructor(private dialog: DialogService,
              public lang: LangService,
              private jobTitleService: JobTitleService,
              private fb: FormBuilder,
              private generalAssociationMeetingService: GeneralAssociationMeetingAttendanceService) {
  }

  get arabicName(): FormControl {
    return this.membersForm.get('arabicName')! as FormControl;
  }

  get englishName(): FormControl {
    return this.membersForm.get('englishName')! as FormControl;
  }

  get identificationNumber(): FormControl {
    return this.membersForm.get('identificationNumber')! as FormControl;
  }

  get jobTitle(): FormControl {
    return this.membersForm.get('jobTitleId')! as FormControl;
  }

  ngOnInit(): void {
    this.jobTitleService.loadAsLookups()
      .subscribe(list => {
        this.jobTitles = list;
      });

    this.buildMemberForm();
  }

  buildMemberForm(): void {
    if(this.isGeneralAssociationMembers) {
      this.membersForm = this.fb.group({
        arabicName: [null, [CustomValidators.required, CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX), CustomValidators.pattern('AR_NUM')]],
        englishName: [null, [CustomValidators.required, CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.pattern('ENG_NUM')]],
        identificationNumber: [null, [CustomValidators.required].concat(CustomValidators.commonValidations.qId)],
        jobTitleId: [null, [CustomValidators.required]]
      });
    } else {
      this.membersForm = this.fb.group({
        arabicName: [null, [CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX), CustomValidators.pattern('AR_NUM')]],
        englishName: [null, [CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.pattern('ENG_NUM')]],
        identificationNumber: [null, [...CustomValidators.commonValidations.qId]]
      });
    }
  }

  openAddAdministrativeBoardMemberForm() {
    this.addMemberFormActive = true;
  }

  selectMember(event: MouseEvent, model: GeneralAssociationExternalMember) {
    this.addMemberFormActive = true;
    event.preventDefault();
    this.selectedMember = model;
    this.membersForm.patchValue(this.selectedMember!);
    this.selectedMemberIndex = this.selectedMembers
      .map(x => x.identificationNumber).indexOf(model.identificationNumber);
  }

  _saveMember(boardMember: GeneralAssociationExternalMember) {
    if (!this.selectedMember) {
      if (!this.isExistMemberInCaseOfAdd(this.selectedMembers, boardMember)) {
        this.selectedMembers = this.selectedMembers.concat(boardMember);
        this.resetMemberForm();
        this.addMemberFormActive = false;
        this.memberListChanged.emit(this.selectedMembers);
      } else {
        this.dialog.error(this.lang.map.selected_item_already_exists);
      }
    } else {
      if (!this.isExistMemberInCaseOfEdit(this.selectedMembers, boardMember, this.selectedMemberIndex!)) {
        let newList = this.selectedMembers.slice();
        newList.splice(this.selectedMemberIndex!, 1);
        newList.splice(this.selectedMemberIndex!, 0, boardMember);
        this.selectedMembers = newList;
        this.resetMemberForm();
        this.addMemberFormActive = false;
        this.memberListChanged.emit(this.selectedMembers);
      } else {
        this.dialog.error(this.lang.map.selected_item_already_exists);
      }
    }
  }

  saveMember() {
    const boardMember = new GeneralAssociationExternalMember().clone(this.membersForm.getRawValue());
    boardMember.jobTitleInfo = boardMember.jobTitleInfo ? boardMember.jobTitleInfo : AdminResult.createInstance(this.jobTitles.find(x => x.id === boardMember.jobTitleId)!);

    this._saveMember(boardMember);
  }

  cancelAddMember() {
    this.resetMemberForm();
    this.addMemberFormActive = false;
  }

  resetMemberForm() {
    this.selectedMember = null;
    this.selectedMemberIndex = null;
    this.membersForm.reset();
  }

  removeMember(event: MouseEvent, model: GeneralAssociationExternalMember) {
    event.preventDefault();
    this.selectedMembers = this.selectedMembers.filter(x => x.identificationNumber != model.identificationNumber);
    this.resetMemberForm();
    this.memberListChanged.emit(this.selectedMembers);
  }

  isExistMemberInCaseOfAdd(selectedMembers: GeneralAssociationExternalMember[], toBeAddedMember: GeneralAssociationExternalMember): boolean {
    return selectedMembers.some(x => x.identificationNumber === toBeAddedMember.identificationNumber);
  }

  isExistMemberInCaseOfEdit(selectedMembers: GeneralAssociationExternalMember[], toBeEditedMember: GeneralAssociationExternalMember, selectedIndex: number): boolean {
    for (let i = 0; i < selectedMembers.length; i++) {
      if (i === selectedIndex) {
        continue;
      }

      if (selectedMembers[i].identificationNumber === toBeEditedMember.identificationNumber) {
        return true;
      }
    }
    return false;
  }

  private openSelectMember(members: GeneralAssociationExternalMember[]) {
    return this.generalAssociationMeetingService.openSelectMemberDialog(members, true, false).onAfterClose$ as Observable<GeneralAssociationExternalMember>;
  }

  searchMembers() {
    const criteria = {
      arabicName: this.arabicName.value,
      englishName: this.englishName.value,
      qId: this.identificationNumber.value,
      jobTitle: this.jobTitle?.value
    };

    this.generalAssociationMeetingService.searchNpoEmployees(criteria)
      .pipe(tap(members => !members.length && this.dialog.info(this.lang.map.no_result_for_your_search_criteria)))
      .pipe(filter(members => !!members.length))
      .pipe(map(items => {
        return items.map(item => this.mapNpoEmployeeToGeneralAssociationExternalMember(item));
      }))
      .pipe(exhaustMap((members) => {
        return members.length === 1 ? of(members[0]) : this.openSelectMember(members);
      }))
      .pipe(filter(item => {
        if(!item) {
          this.resetMemberForm();
          this.addMemberFormActive = false;
        }
        return !!item;
      }))
      .subscribe((item) => {
        this._saveMember(item);
      });
  }

  mapNpoEmployeeToGeneralAssociationExternalMember(npoEmployee: NpoEmployee) {
    const member = new GeneralAssociationExternalMember();
    member.id = npoEmployee.id;
    member.identificationNumber = npoEmployee.qId || npoEmployee.identificationNumber;
    member.arabicName = npoEmployee.arabicName;
    member.englishName = npoEmployee.englishName;
    member.jobTitleId = npoEmployee.jobTitleId;
    member.jobTitleInfo = npoEmployee.jobTitleInfo ? AdminResult.createInstance(npoEmployee.jobTitleInfo) : AdminResult.createInstance({});

    return member;
  }
}
