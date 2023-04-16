import {Component, Input} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl} from '@angular/forms';
import {ListModelComponent} from '@app/generics/ListModel-component';
import {DateUtils} from '@helpers/date-utils';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {JobTitle} from '@models/job-title';
import {OrgMember} from '@models/org-member';
import {LangService} from '@services/lang.service';
import {ToastService} from '@services/toast.service';
import { ComponentType } from '@angular/cdk/portal';
import { MembersPopupComponent } from '../../popups/members-popup/members-popup.component';

@Component({
  selector: 'members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss'],
})
export class MembersComponent extends ListModelComponent<OrgMember> {
  protected _getPopupComponent(): ComponentType<any> {
    return MembersPopupComponent;
  }

  @Input() readonly!: boolean;
  @Input() set list(_list: OrgMember[]) {
    this._list = _list;
  }

  @Input() extended = false;
  @Input() pageTitle!: keyof ILanguageKeys;
  @Input() jobTitles: JobTitle[] = [];
  columns = ['fullName', 'identificationNumber', 'jobTitleId'];
  filterControl: UntypedFormControl = new UntypedFormControl('');


  get list() {
    return this._list;
  }

  constructor(
    private fb: UntypedFormBuilder,
    private toastr: ToastService,
    public lang: LangService
  ) {
    super(OrgMember);
  }


  protected _initComponent(): void {
    if (this.extended) {
      this.form = this.fb.group(this.model.bulildExtendedForm());
    } else if (this.pageTitle === 'board_members') {
      this.form = this.fb.group(this.model.buildExtendedBoardMembersForm());
    } else {
      this.form = this.fb.group(this.model.buildForm());
    }
    this.columns.push('actions');
    this.customData = {
      jobTitles: this.jobTitles,
      pageTitle: this.pageTitle,
      extended: this.extended,
    }
  }

  _selectOne(row: OrgMember): void {
    const _row = {...row};
    (_row.joinDate && (_row.joinDate = DateUtils.changeDateToDatepicker(_row.joinDate)));
    this.form.patchValue(_row);
    this.dialogService.show(this._getPopupComponent(), {
      form: this.form,
      editRecordIndex: this.editRecordIndex,
      model: this.model,
      hideSave: this.hideSave,
      readonly: this.readonly,
      customData: this.customData
    }).onAfterClose$.subscribe((data) => {
      if (data) {
        this.save(data);
      }
      this.cancel();
    })
  }
  _beforeAdd(row: OrgMember): OrgMember | null {
    if (this._list.findIndex(e => e.identificationNumber === row.identificationNumber) !== -1 && (this.editRecordIndex === -1)) {
      this.toastr.error(this.lang.map.msg_duplicated_item);
      return null;
    }

    return row;
  }
}
