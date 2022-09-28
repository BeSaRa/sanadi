import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ListModelComponent } from '@app/generics/ListModel-component';
import { DateUtils } from '@app/helpers/date-utils';
import { ControlWrapper } from '@app/interfaces/i-control-wrapper';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { OrgMember } from '@app/models/org-member';
import { JobTitleService } from '@app/services/job-title.service';
import { LangService } from '@app/services/lang.service';
import { DatepickerOptionsMap } from '@app/types/types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss'],
})
export class MembersComponent extends ListModelComponent<OrgMember> {
  @Input() readonly!: boolean;
  @Input() set list(_list: OrgMember[]) {
    this._list = _list;
  }
  @Input() extended = false;
  @Input() pageTitle!: keyof ILanguageKeys;
  controls = this.getFormControls();
  columns = ['fullName', 'identificationNumber', 'jobTitleId'];
  datepickerOptionsMap: DatepickerOptionsMap = {
    joinDate: DateUtils.getDatepickerOptions({ disablePeriod: 'future' }),
  };
  get list() {
    return this._list;
  }
  constructor(
    private fb: UntypedFormBuilder,
    public lang: LangService,
    private jobTitleService: JobTitleService
  ) {
    super(OrgMember);
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
        load$: this.jobTitleService.loadAsLookups(),
        type: 'dropdown',
      },
    ];
  }
  protected _initComponent(): void {
    if (this.extended) {
      this.form = this.fb.group(this.model.bulildExtendedForm());
    } else {
      this.form = this.fb.group(this.model.buildForm());
    }
    if (this.extended) {
      this.controls.push(
        {
          controlName: 'email',
          label: this.lang.map.lbl_email,
          type: 'text',
        },
        {
          controlName: 'phone',
          label: this.lang.map.lbl_phone,
          type: 'text',
        },
        {
          controlName: 'joinDate',
          label: this.lang.map.first_join_date,
          type: 'date',
        }
      );
      this.columns.push('joinDate', 'email', 'phone');
    }
    this.columns.push('actions');
  }
  _selectOne(row: OrgMember): void {
    const _row = { ...row };
    (_row.joinDate && (_row.joinDate = DateUtils.changeDateToDatepicker(_row.joinDate)));
    this.form.patchValue(_row);
  }
  _beforeAdd(row: OrgMember): OrgMember {
    (row.joinDate && (row.joinDate = DateUtils.getDateStringFromDate(row.joinDate)));
    return row;
  }
}
