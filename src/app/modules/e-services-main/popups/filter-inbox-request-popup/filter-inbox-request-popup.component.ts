import {Component, Inject, OnInit} from '@angular/core';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {LangService} from '@app/services/lang.service';
import {DialogService} from '@app/services/dialog.service';
import {isEmptyObject, objectHasValue} from '@app/helpers/utils';
import {CustomValidators} from '@app/validators/custom-validators';
import {DateUtils} from '@app/helpers/date-utils';
import {IMyInputFieldChanged} from '@nodro7/angular-mydatepicker';
import {DatepickerControlsMap, DatepickerOptionsMap} from '@app/types/types';
import {IInboxCriteria} from '@app/interfaces/i-inbox-criteria';

@Component({
  selector: 'filter-inbox-request-popup',
  templateUrl: './filter-inbox-request-popup.component.html',
  styleUrls: ['./filter-inbox-request-popup.component.scss']
})
export class FilterInboxRequestPopupComponent implements OnInit {
  userClick: typeof UserClickOn = UserClickOn;
  criteria: Partial<IInboxCriteria>;
  form: UntypedFormGroup = {} as UntypedFormGroup;

  datepickerControlsMap: DatepickerControlsMap = {};
  datepickerOptionsMap: DatepickerOptionsMap = {
    createdDateFrom: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    createdDateTo: DateUtils.getDatepickerOptions({disablePeriod: 'none'})
  };

  constructor(@Inject(DIALOG_DATA_TOKEN) public data: any,
              private fb: UntypedFormBuilder,
              private dialogRef: DialogRef,
              public langService: LangService,
              private dialogService: DialogService) {
    this.criteria = data.criteria;
  }


  ngOnInit(): void {
    this._buildForm();
  }

  private _buildForm() {
    this.form = this.fb.group({
      createdDateFrom: [this.criteria.createdDateFrom, [CustomValidators.required]],
      createdDateTo: [this.criteria.createdDateTo, [CustomValidators.required]]
    });
    this._buildDatepickerControlsMap();
  }

  private _buildDatepickerControlsMap() {
    this.datepickerControlsMap = {
      createdDateFrom: this.createdDateFromControl,
      createdDateTo: this.createdDateToControl
    };
  }

  onDateChange(event: IMyInputFieldChanged, fromFieldName: string, toFieldName: string): void {
    DateUtils.setRelatedMinMaxDate({
      fromFieldName,
      toFieldName,
      controlOptionsMap: this.datepickerOptionsMap,
      controlsMap: this.datepickerControlsMap
    });
  }

  get createdDateFromControl(): UntypedFormControl {
    return this.form.get('createdDateFrom') as UntypedFormControl;
  }

  get createdDateToControl(): UntypedFormControl {
    return this.form.get('createdDateTo') as UntypedFormControl;
  }

  get hasFilterCriteria(): boolean {
    return this.form.valid && !isEmptyObject(this.form.value) && objectHasValue(this.form.value);
  }

  filterRecords(): void {
    this.dialogRef.close(this.form.value);
  }

  resetFilter(): void {
    this.dialogService.confirmWithTree(this.langService.map.msg_confirm_reset_filter_select_action, {
      actionBtn: 'btn_reset',
      cancelBtn: 'btn_cancel',
      thirdBtn: 'btn_reset_close'
    }).onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES || click === UserClickOn.THIRD_BTN) {
        this.form.reset();
        if (click === UserClickOn.THIRD_BTN) {
          this.dialogRef.close({});
        }
      }
    })
  }

}
