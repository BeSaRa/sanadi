import {AbstractControl, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {isValidValue} from '../helpers/utils';
import {customValidationTypes} from '../types/types';

const validationPatterns: any = {
  ENG: new RegExp(/^[a-zA-Z ]+$/),
  AR: new RegExp(/^[ء-ي]+$/)
};

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

export function requiredValidator(control: AbstractControl): ValidationErrors | null {
  return !isValidValue(control.value) ? {required: true} : null;
}

export function patternValidator(patternName: customValidationTypes): ValidatorFn {
  if (!patternName || !validationPatterns.hasOwnProperty(patternName)) {
    return Validators.nullValidator;
  }

  return (control: AbstractControl): ValidationErrors | null => {
    if (!isValidValue(control.value)) {
      return null;
    }
    const response: object = {};
    // @ts-ignore
    response[patternName] = true;
    return !validationPatterns[patternName].test(control.value) ? response : null;
  };
}
