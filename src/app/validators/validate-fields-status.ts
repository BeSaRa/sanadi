import {AbstractControl, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {hasValidLength, isValidValue} from '../helpers/utils';
import {customValidationTypes} from '../types/types';

const validationPatterns: any = {
  ENG: new RegExp(/^[a-zA-Z ]+$/),
  AR: new RegExp(/^[\u0621-\u064A ]+$/)
};

export function validateFieldsStatus(fields: string[]): ValidatorFn {
  return (formGroup): ValidationErrors | null => {
    const isInvalid = fields.some((fieldName: string) => {
      return formGroup.get(fieldName)?.invalid;
    });
    return isInvalid ? {required: true} : null;
  };
}

export function numberValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    const isValid = (/^[0-9\u0660-\u0669]+$/g).test(control.value);
    return !isValid ? {number: true} : null;
}

export function maxlengthValidator(maxLength: number): ValidatorFn {
  if (maxLength === 0 || !isValidValue(maxLength)) {
    return Validators.nullValidator;
  }
  return (control: AbstractControl): ValidationErrors | null => {
    if (!isValidValue(control.value) || !hasValidLength(control.value)) {
      return null;
    }
    let isInvalid: boolean;
    if (typeof control.value === 'string') {
      isInvalid = (control.value.trim().length > maxLength);
    } else {
      isInvalid = (control.value.length > maxLength);
    }
    return isInvalid ? {maxlength: {requiredLength: maxLength, actualLength: control.value.length}} : null;
  };
}

export function minlengthValidator(minLength: number): ValidatorFn {
  if (!isValidValue(minLength)) {
    return Validators.nullValidator;
  }
  return (control: AbstractControl): ValidationErrors | null => {
    if (!isValidValue(control.value) || !hasValidLength(control.value)) {
      // don't validate empty values to allow optional controls
      // don't validate values without `length` property
      return null;
    }
    let isInvalid: boolean;
    if (typeof control.value === 'string') {
      isInvalid = (control.value.trim().length < minLength);
    } else {
      isInvalid = (control.value.length < minLength);
    }
    return isInvalid ? {minlength: {requiredLength: minLength, actualLength: control.value.length}} : null;
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
