import { GeneralProcessTemplateFieldTypes } from './../../../../../enums/general-process-template-field-types.enum';
import { CustomGeneralProcessFieldConfig } from './../../../../../interfaces/custom-general-process-field';
import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { LangService } from '@services/lang.service';
import { UntypedFormControl } from '@angular/forms';

@Component({
  selector: 'process-mask-input-field',
  templateUrl: './process-mask-input-field.component.html',
  styleUrls: ['./process-mask-input-field.component.scss']
})
export class ProcessMaskInputFieldComponent extends FieldType<CustomGeneralProcessFieldConfig> implements OnInit {
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
