import { Component, Inject, OnInit } from '@angular/core';
import {  FormBuilder, UntypedFormGroup } from '@angular/forms';
import { ProcessFieldBuilder } from '@app/administration/popups/general-process-popup/process-formly-components/process-fields-builder';
import { CoordinationWithOrganizationTemplate } from '@app/models/corrdination-with-organization-template';
import { DynamicModel } from '@app/models/dynamic-model';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';

@Component({
  selector: 'app-dynamic-templates-popup',
  templateUrl: './dynamic-templates-popup.component.html',
  styleUrls: ['./dynamic-templates-popup.component.scss']
})
export class DynamicTemplatesPopupComponent implements OnInit {
  form: UntypedFormGroup;
  editIndex: number;
  model: CoordinationWithOrganizationTemplate;
  viewOnly: boolean;
  readonly: boolean;
  usedModel: DynamicModel;
  fieldBuilder: ProcessFieldBuilder;
  constructor(
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      form: UntypedFormGroup,
      editIndex: number,
      model: CoordinationWithOrganizationTemplate,
      viewOnly: boolean,
      readonly: boolean,
      usedModel: DynamicModel,
      fieldBuilder: ProcessFieldBuilder,
    },
    public lang: LangService,
    private fb: FormBuilder,
    private dialogRef: DialogRef,
  ) {
    this.form = data.form;
    this.editIndex = data.editIndex;
    this.model = data.model;
    this.viewOnly = data.viewOnly;
    this.readonly = data.readonly;
    this.usedModel = data.usedModel;
    this.fieldBuilder = data.fieldBuilder;
  }
  ngOnInit() {
    if (this.model) {
      this.fieldBuilder.buildMode = 'use';
      if (this.model?.template) {
        this.fieldBuilder.generateFromString(this.model?.template);
        if (this.readonly || this.viewOnly) {
          this.fieldBuilder.buildMode = 'view'
        }
      } else {
        this.fieldBuilder.generateFromString(this.usedModel?.template);
      }
    }
  }

  mapForm(form: any): CoordinationWithOrganizationTemplate {
    const entity: CoordinationWithOrganizationTemplate = new CoordinationWithOrganizationTemplate().clone(form);

    return entity;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(this.mapForm(this.form.getRawValue()));
  }
}
