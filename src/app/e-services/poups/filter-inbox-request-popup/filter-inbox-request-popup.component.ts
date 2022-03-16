import {Component, Inject, OnInit} from '@angular/core';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {LangService} from '@app/services/lang.service';
import {DialogService} from '@app/services/dialog.service';
import {isEmptyObject, objectHasValue} from '@app/helpers/utils';
import {CustomValidators} from '@app/validators/custom-validators';
import {DateUtils} from '@app/helpers/date-utils';
import {IMyInputFieldChanged} from 'angular-mydatepicker';
import {DatepickerControlsMap, DatepickerOptionsMap} from '@app/types/types';

@Component({
  selector: 'filter-inbox-request-popup',
  templateUrl: './filter-inbox-request-popup.component.html',
  styleUrls: ['./filter-inbox-request-popup.component.scss']
})
export class FilterInboxRequestPopupComponent implements OnInit {
  userClick: typeof UserClickOn = UserClickOn;
  criteria: any;
  form: FormGroup = {} as FormGroup;

  datepickerControlsMap: DatepickerControlsMap = {};

  datepickerOptionsMap: DatepickerOptionsMap = {
    createdDateFrom: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    createdDateTo: DateUtils.getDatepickerOptions({disablePeriod: 'none'})
  };

  constructor(@Inject(DIALOG_DATA_TOKEN) public data: any,
              private fb: FormBuilder,
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
    DateUtils.setRelatedMinDate({
      fromFieldName,
      toFieldName,
      controlOptionsMap: this.datepickerOptionsMap,
      controlsMap: this.datepickerControlsMap
    });
    DateUtils.setRelatedMaxDate({
      fromFieldName,
      toFieldName,
      controlOptionsMap: this.datepickerOptionsMap,
      controlsMap: this.datepickerControlsMap
    });
  }

  get createdDateFromControl(): FormControl {
    return this.form.get('createdDateFrom') as FormControl;
  }

  get createdDateToControl(): FormControl {
    return this.form.get('createdDateTo') as FormControl;
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
        this.form.patchValue({
          requestYear: null,
          orgId: null,
          benCategory: null,
          requestType: null,
          gender: null
        });
        if (click === UserClickOn.THIRD_BTN) {
          this.dialogRef.close({});
        }
      }
    })
  }

}
