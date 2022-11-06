import { GeneralProcessTemplateFieldTypes } from './../../../../enums/general-process-template-field-types.enum';
import { UntypedFormGroup } from '@angular/forms';
import { GenerealProcessTemplate } from './../../../../models/general-process-template';
import { FormlyFieldConfig } from '@ngx-formly/core/lib/components/formly.field.config';
import { uniqueId } from 'lodash';

export class ProcessFieldBuilder {
  private _fields: GenerealProcessTemplate[] = [];
  get fields(): GenerealProcessTemplate[] {
    return this._fields;
  }
  fieldsGroups: FormlyFieldConfig[] = [];
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
      fieldGroup: fields.map(f => f.buildField())
    }
    return row
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
      required: form.value.required,
      pattern: form.value.pattern,
    });
    let prevField = this.getFieldByIdentifyingName(form.value.identifyingName)
    if (!prevField)
      this._fields = [...this.fields, field]
    else
      Object.assign(prevField, field);
    form.reset();
    this._FormChange();
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
    this._FormChange();
  }
  getCircularReplacer() {
    const seen = new WeakSet();
    return (key: any, value: any) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    };
  };
}
