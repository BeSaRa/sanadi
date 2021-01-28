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
    if (!control.value) {
      return null;
    }
    const isValid = (/^[0-9\u0660-\u0669]+$/g).test(control.value);
    return !isValid ? {number: true} : null;
  };
}

export function requiredValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (typeof control.value === 'undefined' || control.value === null) {
      return {required: true};
    }
    if (typeof control.value === 'string') {
      return (control.value.trim().length === 0 ? {required: true} : null);
    }
    return control.value.length === 0 ? {required: true} : null;
  };
}

