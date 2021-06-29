import {Component, OnInit} from '@angular/core';
import {FieldType} from '@ngx-formly/core';
import {CustomFormlyFieldConfig} from '../../../interfaces/custom-formly-field-config';
import {LangService} from '../../../services/lang.service';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'formly-mask-input-field',
  templateUrl: './formly-mask-input-field.component.html',
  styleUrls: ['./formly-mask-input-field.component.scss']
})
export class FormlyMaskInputFieldComponent extends FieldType<CustomFormlyFieldConfig> implements OnInit {
  get mask(): string {
    return this.field.mask || '';
  }

  get control(): FormControl {
    return this.formControl as FormControl;
  };

  constructor(public lang: LangService) {
    super();
  }

  ngOnInit(): void {
  }

}
