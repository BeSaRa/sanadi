import { EmploymentService } from '@app/services/employment.service';
import { DIALOG_DATA_TOKEN } from './../../../../shared/tokens/tokens';
import { Employee } from './../../../../models/employee';
import { Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { DatepickerOptionsMap } from './../../../../types/types';
import { IMyInputFieldChanged } from 'angular-mydatepicker';
import { DateUtils } from './../../../../helpers/date-utils';
import { LangService } from '@services/lang.service';
import { Component, Inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-approve-employment-date',
  templateUrl: './approve-employment-date.component.html',
  styleUrls: ['./approve-employment-date.component.scss']
})
export class ApproveEmploymentDateComponent implements OnInit {
  datepickerOptionsMap: DatepickerOptionsMap = {
    licenseStartDate: DateUtils.getDatepickerOptions({
      disablePeriod: "none",
    }),
    licenseEndDate: DateUtils.getDatepickerOptions({
      disablePeriod: "none",
    }),
  };
  form!: FormGroup;
  constructor(@Inject(DIALOG_DATA_TOKEN) public data: {
    model: Employee,
    service: EmploymentService
  }, public lang: LangService) { }

  ngOnInit() {
    this.form = new FormGroup({
      licenseStartDate: new FormControl(null, [Validators.required]),
      licenseEndDate: new FormControl(null, [Validators.required])
    })
  }

  openDateMenu(ref: any) {
    ref.toggleCalendar();
  }
  setExpirDate() {
    this.data.service.onSetExpirDate.emit(this.form.value)
  }
}
