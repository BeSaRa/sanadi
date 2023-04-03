import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { DateUtils } from '@app/helpers/date-utils';
import { ControlWrapper } from '@app/interfaces/i-control-wrapper';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { AdminResult } from '@app/models/admin-result';
import { JobTitle } from '@app/models/job-title';
import { OrgMember } from '@app/models/org-member';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { DatepickerOptionsMap } from '@app/types/types';

@Component({
  selector: 'app-members-popup',
  templateUrl: './members-popup.component.html',
  styleUrls: ['./members-popup.component.scss']
})
export class MembersPopupComponent implements OnInit {
  model!: OrgMember;
  form: UntypedFormGroup;
  readonly: boolean;
  hideSave: boolean;
  editRecordIndex: number;
  extended: boolean;
  pageTitle!: keyof ILanguageKeys;
  jobTitles: JobTitle[] = [];
  controls!: ControlWrapper[];
  datepickerOptionsMap: DatepickerOptionsMap = {
    joinDate: DateUtils.getDatepickerOptions({ disablePeriod: 'future' }),
  };
  constructor(
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      form: UntypedFormGroup,
      readonly: boolean,
      hideSave: boolean,
      editRecordIndex: number,
      model: OrgMember,
      customData: any
    },
    public lang: LangService,
    private dialogRef: DialogRef,
  ) {
    this.form = data.form;
    this.hideSave = data.hideSave;
    this.readonly = data.readonly;
    this.editRecordIndex = data.editRecordIndex;
    this.model = data.model;
    this.extended = data.customData.extended;
    this.pageTitle = data.customData.pageTitle;
    this.jobTitles = data.customData.jobTitles;
  }

  ngOnInit(): void {
    this.controls = this.getFormControls();
    if (this.extended) {
      this.controls.push(
        {
          controlName: 'email',
          label: this.lang.map.email_for_working_authority,
          type: 'text',
        },
        {
          controlName: 'phone',
          label: this.lang.map.phone_for_working_authority,
          type: 'text',
        },
        {
          controlName: 'joinDate',
          label: this.lang.map.job_title_occupied_date,
          type: 'date',
        }
      );
    } else if (this.pageTitle === 'board_members') {
      this.controls.push(
        {
          controlName: 'joinDate',
          label: this.lang.map.first_join_date,
          type: 'date',
        }
      );
    }
  }

  getFormControls(): ControlWrapper[] {
    return [
      {
        controlName: 'fullName',
        label: this.lang.map.full_name,
        type: 'text',
      },
      {
        controlName: 'identificationNumber',
        label: this.lang.map.personal_number,
        type: 'text',
      },
      {
        controlName: 'jobTitleId',
        label: this.lang.map.job_title,
        load: this.jobTitles,
        dropdownValue: 'id',
        type: 'dropdown',
        dropdownOptionDisabled: (optionItem: JobTitle) => {
          return !optionItem.isActive();
        }
      },
    ];
  }

  mapFormToMember(form: any): OrgMember {
    const member: OrgMember = new OrgMember().clone(form);

    const jobTitle = this.jobTitles.find(e => e.id === form.jobTitleId);
    member.jobTitleInfo = AdminResult.createInstance({ ...jobTitle });
    (member.joinDate && (member.joinDate = DateUtils.getDateStringFromDate(form.joinDate)));
    return member;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(
      this.mapFormToMember(
        this.form.getRawValue()
      ))
  }
}
