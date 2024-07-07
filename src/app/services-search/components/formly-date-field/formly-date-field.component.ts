import {Component, OnInit} from '@angular/core';
import {FieldType} from '@ngx-formly/core';
import {UntypedFormControl} from '@angular/forms';
import {IAngularMyDpOptions} from '@nodro7/angular-mydatepicker';
import {DateUtils} from '@helpers/date-utils';
import {CustomFormlyFieldConfig} from '@contracts/custom-formly-field-config';

@Component({
  selector: 'formly-date-field',
  templateUrl: './formly-date-field.component.html',
  styleUrls: ['./formly-date-field.component.scss']
})
export class FormlyDateFieldComponent extends FieldType<CustomFormlyFieldConfig> implements OnInit {
  dateOptions: IAngularMyDpOptions = DateUtils.getDatepickerOptions({
    disablePeriod: 'none'
  });

  get control(): UntypedFormControl {
    return this.formControl as UntypedFormControl;
  }

  get readonly() {
    return !!this.field.templateOptions?.readonly;
  }
  constructor() {
    super();
  }

  ngOnInit(): void {
    this.field.defaultValue ? this.control.setValue(this.field.defaultValue) : this.control.setValue(this.control.value);
  }

}
