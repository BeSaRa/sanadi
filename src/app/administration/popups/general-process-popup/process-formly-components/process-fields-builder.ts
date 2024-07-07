import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';
import { UntypedFormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FieldMode } from '@app/interfaces/custom-formly-field-config';
import { TemplateFieldTypes } from '@app/enums/template-field-types.enum';
import { TemplateField } from '@app/models/template-field';
import { CustomValidators } from '@app/validators/custom-validators';

export class ProcessFieldBuilder {
  buildMode: FieldMode = 'init'
  fieldsGroups: FormlyFieldConfig[] = [];
  private static _selectField: Subject<string> = new Subject<string>();
  private _fields: TemplateField[] = [];
  get fields(): TemplateField[] {
    return this._fields;
  }
  private _FormChange() {
    this.fieldsGroups = [];
    this._fields = this.fields.sort((ff, fl) => +ff.order - +fl.order);
    let fields: TemplateField[] = [];
    for (let i = 0; i < this.fields.length; i++) {
      const field = this.fields[i];
      if (field.type == TemplateFieldTypes.textarea) {
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
  private _buildRow(fields: TemplateField[]) {
    const row = {
      fieldGroupClassName: 'row mb-4',
      fieldGroup: fields.map(f => f.buildField(this.buildMode))
    }
    return row
  }
  formChange() {
    this._FormChange()
  }
  static listenToSelectField() {
    return this._selectField
  }
  static setlectField(fieldId: string) {
    this._selectField.next(fieldId);
  }
  generateAsString(): string {
    const fields = this.fields.map((field: TemplateField) => {
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
        options: field.options,
        value: field.value,
        status: field.status,
        showOnTable: field.showOnTable
      }
    })
    return JSON.stringify(fields);
  }
  generateFromString(template?: string) {
    of<TemplateField[]>(JSON.parse(template || '[]')).pipe(
      map((fields: TemplateField[]) => {
        return fields.map(f => new TemplateField().clone(f))
      })
    ).subscribe((templateFields: TemplateField[]) => {
      this._fields = templateFields;
      this.formChange();
    })
  }
  setField(form: UntypedFormGroup) {
    const field = new TemplateField().clone({
      id: form.value.identifyingName,
      identifyingName: form.value.identifyingName,
      arName: form.value.arName,
      enName: form.value.enName,
      note: form.value.note,
      order: form.value.order,
      type: form.value.type,
      status: form.value.status,
      showOnTable: form.value.showOnTable,
      mask: form.value.type == TemplateFieldTypes.number ? CustomValidators.inputMaskPatterns.NUMBER_ONLY : '',
      required: form.value.required,
      pattern: form.value.pattern,
      value: form.value.value,
      options:
        form.value.type == TemplateFieldTypes.yesOrNo
          ? [{ id: 1, name: 'No' }, { id: 2, name: 'Yes' }]
          : form.value.type == TemplateFieldTypes.selectField
            ? form.value.options : []
    });
    let prevField = this.getFieldByIdentifyingName(form.value.identifyingName)
    if (!prevField)
      this._fields = [...this.fields, field]
    else
      Object.assign(prevField, field);
    form.reset();
    form.patchValue({
      status: 1,
      showOnTable: 1
    })
    this.formChange();
  }
  getFieldById(id: string): TemplateField | undefined {
    return this.fields.find(f => f.id == id);
  }
  getFieldByIdentifyingName(id: string): TemplateField | undefined {
    return this.fields.find(f => f.identifyingName == id);
  }
  deleteField(form: UntypedFormGroup) {
    const index = this.fields.findIndex(f => f.identifyingName == form.value.identifyingName);
    this.fields.splice(index, 1);
    form.reset();
    this.formChange();
  }
}
