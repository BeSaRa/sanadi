import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { DateUtils } from '@app/helpers/date-utils';
import { ControlWrapper } from '@app/interfaces/i-control-wrapper';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { AdminResult } from '@app/models/admin-result';
import { JobTitle } from '@app/models/job-title';
import { OrgMember } from '@app/models/org-member';
import { JobTitleService } from '@app/services/job-title.service';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { DatepickerOptionsMap } from '@app/types/types';
import { CommonUtils } from "@helpers/common-utils";

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
  hideFullScreen = false;
  editRecordIndex: number;
  extended: boolean;
  pageTitle!: keyof ILanguageKeys;
  controls!: ControlWrapper[];
  operation!: OperationTypes;
  datepickerOptionsMap: DatepickerOptionsMap = {
    joinDate: DateUtils.getDatepickerOptions({ disablePeriod: 'future' }),
  };
  jobTitleList: JobTitle[] = [];

  constructor(
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      form: UntypedFormGroup,
      readonly: boolean,
      hideSave: boolean,
      editRecordIndex: number,
      model: OrgMember,
      customData: any,
      operation: OperationTypes
    },
    public lang: LangService,
    private jobTitleService: JobTitleService,
    private dialogRef: DialogRef,
  ) {
    this.form = data.form;
    this.hideSave = data.hideSave;
    this.readonly = data.readonly;
    this.editRecordIndex = data.editRecordIndex;
    this.operation = data.operation;
    this.model = data.model;
    this.extended = data.customData.extended;
    this.pageTitle = data.customData.pageTitle;
  }

  ngOnInit(): void {
    this.buildFormControls();
  }

  buildFormControls(): void {
    this.jobTitleService.loadAsLookups().subscribe((jobTitles) => {
      this.jobTitleList = jobTitles;
      this.controls = [
        {
          controlName: 'fullName',
          langKey: 'full_name',
          type: 'text',
        },
        {
          controlName: 'identificationNumber',
          langKey: 'personal_number',
          type: 'text',
        },
        {
          controlName: 'jobTitleId',
          langKey: 'job_title',
          type: 'dropdown',
          load: jobTitles,
          dropdownValue: 'id',
          dropdownOptionDisabled: (optionItem: JobTitle) => {
            return !optionItem.isActive();
          }
        },
      ];
      if (this.extended) {
        this.controls.push(
          {
            controlName: 'email',
            langKey: 'email_for_working_authority',
            type: 'text',
          },
          {
            controlName: 'phone',
            langKey: 'phone_for_working_authority',
            type: 'text',
          },
          {
            controlName: 'joinDate',
            langKey: 'job_title_occupied_date',
            type: 'date',
          }
        );
      } else if (this.pageTitle === 'board_members') {
        this.controls.push(
          {
            controlName: 'joinDate',
            langKey: 'first_join_date',
            type: 'date',
          }
        );
      }
    })
  }

  mapFormToMember(form: any): OrgMember {
    const member: OrgMember = new OrgMember().clone({ ...this.model, ...form });
    (member.joinDate && (member.joinDate = DateUtils.getDateStringFromDate(form.joinDate)));
    member.jobTitleInfo = AdminResult.createInstance(({
      ...this.jobTitleList.find(e => e.id === form.jobTitleId)
    }));
    return member;
  }

  save() {
    this.dialogRef.close(
      this.mapFormToMember(
        this.form.getRawValue()
      ))
  }

  displayFormValidity(form?: UntypedFormGroup | null, element?: HTMLElement | string): void {
    CommonUtils.displayFormValidity((form || this.form), element);
  }
}
