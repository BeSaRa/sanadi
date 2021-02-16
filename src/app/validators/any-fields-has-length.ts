import {ValidationErrors, ValidatorFn} from '@angular/forms';

export function anyFieldsHasLength(fields: string[]): ValidatorFn {
  return (control): ValidationErrors | null => {
    const valid = fields.some((field) => {
      const value = control.get(field)?.value;
      return value ? value.trim().length : false;
    });
    return valid ? null : {atLeastOneRequired: fields};
  };
}
