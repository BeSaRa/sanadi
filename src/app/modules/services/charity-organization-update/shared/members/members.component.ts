import {Component, Input} from '@angular/core';
import {UntypedFormBuilder} from '@angular/forms';
import {ListModelComponent} from '@app/generics/ListModel-component';
import {DateUtils} from '@helpers/date-utils';
import {ControlWrapper} from '@contracts/i-control-wrapper';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {AdminResult} from '@models/admin-result';
import {JobTitle} from '@models/job-title';
import {OrgMember} from '@models/org-member';
import {LangService} from '@services/lang.service';
import {ToastService} from '@services/toast.service';
import {DatepickerOptionsMap} from '@app/types/types';

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
  @Input() jobTitles: JobTitle[] = [];
  controls!: ControlWrapper[];
  columns = ['fullName', 'identificationNumber', 'jobTitleId'];
  datepickerOptionsMap: DatepickerOptionsMap = {
    joinDate: DateUtils.getDatepickerOptions({disablePeriod: 'future'}),
  };

  get list() {
    return this._list;
  }

  constructor(
    private fb: UntypedFormBuilder,
    public lang: LangService,
    private toastr: ToastService
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
        load: this.jobTitles,
        dropdownValue: 'id',
        type: 'dropdown',
        dropdownOptionDisabled: (optionItem: JobTitle) => {
          return !optionItem.isActive();
        }
      },
    ];
  }

  protected _initComponent(): void {
    this.controls = this.getFormControls();
    if (this.extended) {
      this.form = this.fb.group(this.model.bulildExtendedForm());
    } else if (this.pageTitle === 'board_members') {
      this.form = this.fb.group(this.model.buildExtendedBoardMembersForm());
    } else {
      this.form = this.fb.group(this.model.buildForm());
    }
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
      this.columns.push('joinDate', 'email', 'phone');
    } else if (this.pageTitle === 'board_members') {

      this.controls.push(
        {
          controlName: 'joinDate',
          label: this.lang.map.first_join_date,
          type: 'date',
        }
      );
      this.columns.push('joinDate');
    }
    this.columns.push('actions');
  }

  _selectOne(row: OrgMember): void {
    const _row = {...row};
    (_row.joinDate && (_row.joinDate = DateUtils.changeDateToDatepicker(_row.joinDate)));
    this.form.patchValue(_row);
  }

  _beforeAdd(row: OrgMember): OrgMember | null {
    if (this._list.findIndex(e => e.identificationNumber === row.identificationNumber) !== -1 && (this.editRecordIndex === -1)) {
      this.toastr.error(this.lang.map.msg_duplicated_item);
      return null;
    }

    const jobTitle = this.jobTitles.find(e => e.id === row.jobTitleId);
    row.jobTitleInfo = AdminResult.createInstance({...jobTitle});
    (row.joinDate && (row.joinDate = DateUtils.getDateStringFromDate(row.joinDate)));
    return row;
  }
}
