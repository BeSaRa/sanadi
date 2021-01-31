import {
  validateFieldsStatus,
  requiredValidator as required,
  numberValidator as number,
  patternValidator as pattern,
  minlengthValidator as minLength,
  maxlengthValidator as maxLength
} from './validate-fields-status';
import {AbstractControl} from '@angular/forms';
import {IKeyValue} from '../interfaces/i-key-value';
import {IValidationInfo} from '../interfaces/i-validation-info';

const defaultLengths = {
  MIN_LENGTH: 3,
  ARABIC_NAME_MAX: 300,
  ENGLISH_NAME_MAX: 300,
  EMAIL_MAX: 200,
  PHONE_NUMBER_MAX: 50,
  ADDRESS_MAX: 1000
};

const errorKeys: IKeyValue = {
  required: {key: 'err_required_field', replaceValues: null},
  email: {key: 'err_invalid_email', replaceValues: null},
  number: {key: 'err_number_only', replaceValues: null},
  minlength: {
    key: 'err_specific_min_length',
    replaceValues: (message: string, errorValue: any, fieldLabelKey: string): string => {
      return message.change({field: fieldLabelKey, length: errorValue.requiredLength});
    }
  },
  maxlength: {
    key: 'err_specific_max_length',
    replaceValues: (message: string, errorValue: any, fieldLabelText: string): string => {
      return message.change({field: fieldLabelText, length: errorValue.requiredLength});
    }
  },
  min: {
    key: 'err_min_number',
    replaceValues: (message: string, errorValue: any, fieldLabelKey: string): string => {
      return message.change({min: errorValue.min});
    }
  },
  max: {
    key: 'err_max_number',
    replaceValues: (message: string, errorValue: any, fieldLabelKey: string): string => {
      return message.change({max: errorValue.max});
    }
  },
  ENG: {key: 'err_english_only', replaceValues: null},
  AR: {key: 'err_arabic_only', replaceValues: null}
};

function getValidationData(control: AbstractControl, errorName: string): IValidationInfo {
  return {
    fieldName: _getControlName(control),
    errorName,
    errorValue: _getErrorValue(control, errorName),
    message: errorKeys[errorName]
  };
}

function _getErrorValue(control: AbstractControl, errorName: any): any {
  return control.errors ? control.errors[errorName] : null;
}

function _getControlName(control: AbstractControl): string | null {
  if (!control || !control.parent) {
    return null;
  }
  const formGroup = control.parent.controls;
  if (!formGroup) {
    return null;
  }
  // @ts-ignore
  return Object.keys(formGroup).find(name => control === formGroup[name]) || null;
}

export const CustomValidators = {
  validateFieldsStatus,
  required,
  pattern,
  number,
  minLength,
  maxLength,
  getValidationData,
  defaultLengths
};
