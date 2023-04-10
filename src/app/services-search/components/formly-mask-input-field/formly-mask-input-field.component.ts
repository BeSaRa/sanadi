import {Component, OnInit} from '@angular/core';
import {FieldType} from '@ngx-formly/core';
import {CustomFormlyFieldConfig} from '@contracts/custom-formly-field-config';
import {LangService} from '@services/lang.service';
import {UntypedFormControl} from '@angular/forms';

@Component({
  selector: 'formly-mask-input-field',
  templateUrl: './formly-mask-input-field.component.html',
  styleUrls: ['./formly-mask-input-field.component.scss']
})
export class FormlyMaskInputFieldComponent extends FieldType<CustomFormlyFieldConfig> implements OnInit {
  get mask(): string {
    return this.field.mask || '';
  }

  get control(): UntypedFormControl {
    return this.formControl as UntypedFormControl;
  };

  constructor(public lang: LangService) {
    super();
  }

  ngOnInit(): void {
  }

}
