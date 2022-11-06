import { CustomValidators } from './../../../../validators/custom-validators';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';
import { FieldMode } from './../../../../interfaces/custom-general-process-field';
import { GeneralProcessTemplateFieldTypes } from './../../../../enums/general-process-template-field-types.enum';
import { UntypedFormGroup } from '@angular/forms';
import { GenerealProcessTemplate } from './../../../../models/general-process-template';
import { FormlyFieldConfig } from '@ngx-formly/core/lib/components/formly.field.config';
import { uniqueId } from 'lodash';

export class ProcessFieldBuilder {
  buildMode: FieldMode = 'init'
  fieldsGroups: FormlyFieldConfig[] = [];
  private _fields: GenerealProcessTemplate[] = [];
  get fields(): GenerealProcessTemplate[] {
    return this._fields;
  }
  private _FormChange() {
    this.fieldsGroups = [];
    this._fields = this.fields.sort((ff, fl) => +ff.order - +fl.order);
    let fields: GenerealProcessTemplate[] = [];
    for (let i = 0; i < this.fields.length; i++) {
      const field = this.fields[i];
      if (field.type == GeneralProcessTemplateFieldTypes.textarea) {
        if (fields.length) {
          this.fieldsGroups = [...this.fieldsGroups, this._buildRow(fields)]
          fields = [];
        }
        this.fieldsGroups.push(this._buildRow([field]))
      } else {
        fields.push(field);
        if (fields.length == 3) {
          this.fieldsGroups = [...this.fieldsGroups, this._buildRow(fields)]
          fields = [];
        }
      }
      if (i == this.fields.length - 1 && fields.length) {
        this.fieldsGroups = [...this.fieldsGroups, this._buildRow(fields)]
        fields = [];
      }
    }
  }
  private _buildRow(fields: GenerealProcessTemplate[]) {
    const row = {
      fieldGroupClassName: 'row mb-4',
      fieldGroup: fields.map(f => f.buildField(this.buildMode))
    }
    return row
  }
  formChange() {
    this._FormChange()
  }
  generateAsString(): string {
    const fields = this.fields.map((field: GenerealProcessTemplate) => {
      return {
        id: field.id,
        identifyingName: field.identifyingName,
        arName: field.arName,
        enName: field.enName,
        note: field.note,
        order: field.order,
        wrappers: field.wrappers,
        type: field.type,
        pattern: field.pattern,
        mask: field.mask,
        required: field.required,
        options: field.options
      }
    })
    return JSON.stringify(fields);
  }
  generateFromString(template?: string) {
    of<GenerealProcessTemplate[]>(JSON.parse(template || '[]')).pipe(
      map((fields: GenerealProcessTemplate[]) => {
        return fields.map(f => new GenerealProcessTemplate().clone(f))
      })
    ).subscribe((templateFields: GenerealProcessTemplate[]) => {
      this._fields = templateFields;
      this.formChange();
    })
  }
  setField(form: UntypedFormGroup) {
    const field = new GenerealProcessTemplate().clone({
      id: uniqueId('field_'),
      identifyingName: form.value.identifyingName,
      arName: form.value.arName,
      enName: form.value.enName,
      note: form.value.note,
      order: form.value.order,
      type: form.value.type,
      mask: form.value.type == GeneralProcessTemplateFieldTypes.number ? CustomValidators.inputMaskPatterns.NUMBER_ONLY : '',
      required: form.value.required,
      pattern: form.value.pattern,
    });
    let prevField = this.getFieldByIdentifyingName(form.value.identifyingName)
    if (!prevField)
      this._fields = [...this.fields, field]
    else
      Object.assign(prevField, field);
    form.reset();
    this.formChange();
  }
  getFieldById(id: string): GenerealProcessTemplate | undefined {
    return this.fields.find(f => f.id == id);
  }
  getFieldByIdentifyingName(id: string): GenerealProcessTemplate | undefined {
    return this.fields.find(f => f.identifyingName == id);
  }
  deleteField(form: UntypedFormGroup) {
    const index = this.fields.findIndex(f => f.identifyingName == form.value.identifyingName);
    this.fields.splice(index, 1);
    form.reset();
    this.formChange();
  }
}
