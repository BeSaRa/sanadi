import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export function validateFieldsStatus(fields: string[]): ValidatorFn {
  return (formGroup): ValidationErrors | null => {
    const isInvalid = fields.some((fieldName: string) => {
      return formGroup.get(fieldName)?.invalid;
    });
    return isInvalid ? {required: true} : null;
  };
}

export function numberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const isValid = (/^[0-9\u0660-\u0669]+$/g).test(control.value);
    return !isValid ? {number: true} : null;
  };
}

