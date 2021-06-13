import {Component, OnInit} from '@angular/core';
import {FieldType} from '@ngx-formly/core';
import {FormControl} from '@angular/forms';
import {IAngularMyDpOptions} from 'angular-mydatepicker';
import {DateUtils} from '../../../helpers/date-utils';
import {CustomFormlyFieldConfig} from '../../../interfaces/custom-formly-field-config';

@Component({
  selector: 'formly-date-field',
  templateUrl: './formly-date-field.component.html',
  styleUrls: ['./formly-date-field.component.scss']
})
export class FormlyDateFieldComponent extends FieldType<CustomFormlyFieldConfig> implements OnInit {
  dateOptions: IAngularMyDpOptions = DateUtils.getDatepickerOptions({
    disablePeriod: 'none'
  });

  get control(): FormControl {
    return this.formControl as FormControl;
  }

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.field.defaultValue ? this.control.setValue(this.field.defaultValue) : this.control.setValue(this.control.value);
  }

}
