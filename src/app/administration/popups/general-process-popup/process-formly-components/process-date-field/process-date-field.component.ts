import { CustomGeneralProcessFieldConfig } from './../../../../../interfaces/custom-general-process-field';
import {Component, OnInit} from '@angular/core';
import {FieldType} from '@ngx-formly/core';
import {UntypedFormControl} from '@angular/forms';
import {IAngularMyDpOptions} from 'angular-mydatepicker';
import {DateUtils} from '@helpers/date-utils';

@Component({
  selector: 'process-date-field',
  templateUrl: './process-date-field.component.html',
  styleUrls: ['./process-date-field.component.scss']
})
export class ProcessDateFieldComponent extends FieldType<CustomGeneralProcessFieldConfig> implements OnInit {
  dateOptions: IAngularMyDpOptions = DateUtils.getDatepickerOptions({
    disablePeriod: 'none'
  });

  get control(): UntypedFormControl {
    return this.formControl as UntypedFormControl;
  }

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.field.defaultValue ? this.control.setValue(this.field.defaultValue) : this.control.setValue(this.control.value);
  }

}
