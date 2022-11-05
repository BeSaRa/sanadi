import { GeneralProcessTemplateFieldTypes } from './../../../../enums/general-process-template-field-types.enum';
import { UntypedFormGroup } from '@angular/forms';
import { GenerealProcessTemplate } from './../../../../models/general-process-template';
import { FormlyFieldConfig } from '@ngx-formly/core/lib/components/formly.field.config';

export class ProcessFieldBuilder {
  private _fields: GenerealProcessTemplate[] = [];
  fieldsGroups: FormlyFieldConfig[] = [];
  private _listenToFormCange() {
    this.fieldsGroups = [];
    this._fields = this._fields.sort((ff, fl) => +ff.order - +fl.order);
    let fields: GenerealProcessTemplate[] = [];
    for (let i = 0; i < this._fields.length; i++) {
      const field = this._fields[i];
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
      if (i == this._fields.length - 1 && fields.length) {
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
  addField(form: UntypedFormGroup) {
    const field = new GenerealProcessTemplate().clone({
      identifyingName: form.value.identifyingName,
      arName: form.value.arName,
      enName: form.value.enName,
      note: form.value.note,
      order: form.value.order,
      type: form.value.type,
      required: form.value.required,
      pattern: form.value.pattern,
    });
    form.reset();
    this._fields = [...this._fields, field]
    this._listenToFormCange();
  }
}



