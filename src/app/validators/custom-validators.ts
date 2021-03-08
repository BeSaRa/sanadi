import {
  maxlengthValidator as maxLength,
  minlengthValidator as minLength,
  numberValidator as number,
  patternValidator as pattern,
  requiredValidator as required,
  validateFieldsStatus,
  maxDateValidator as maxDate,
  minDateValidator as minDate
} from './validate-fields-status';
import {AbstractControl} from '@angular/forms';
import {IKeyValue} from '../interfaces/i-key-value';
import {IValidationInfo} from '../interfaces/i-validation-info';
import {anyFieldsHasLength} from './any-fields-has-length';

const defaultLengths = {
  MIN_LENGTH: 3,
  ARABIC_NAME_MAX: 300,
  ENGLISH_NAME_MAX: 300,
  EMAIL_MAX: 200,
  PHONE_NUMBER_MAX: 20,
  ADDRESS_MAX: 1000,
  QID_MIN: 11,
  QID_MAX: 11
};

const commonValidations = {
  qId: [number, minLength(defaultLengths.QID_MIN), maxLength(defaultLengths.QID_MAX)],
  passport: [pattern('ENG_NUM_ONLY'), maxLength(20)],
  gccId: [number, maxLength(20)],
  gccRId: [number, maxLength(20)],
  visa: [number, maxLength(20)],
  phone: [number, maxLength(defaultLengths.PHONE_NUMBER_MAX)]
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
  ENG_NUM: {key: 'err_english_num_only', replaceValues: null},
  AR_NUM: {key: 'err_arabic_num_only', replaceValues: null},
  ENG_ONLY: {key: 'err_english_only', replaceValues: null},
  AR_ONLY: {key: 'err_arabic_only', replaceValues: null},
  ENG_AR_ONLY: {key: 'err_english_arabic_only', replaceValues: null},
  ENG_NUM_ONLY: {key: 'err_english_num_only', replaceValues: null},
  PASSPORT: {key: 'err_invalid_passport_format', replaceValues: null},
  atLeastOneRequired: {
    key: 'at_least_one_field_should_be_filled',
    replaceValues: (message: string, errorValue: any, fieldLabelKey: string): string => {
      return message.change({fields: '( ' + errorValue.join(', ') + ') '});
    }
  },
  format: {key: 'err_invalid_format', replaceValues: null},
  maxDate: {
    key: 'err_max_date',
    replaceValues: (message: string, errorValue: any, fieldLabelText: string): string => {
      return message.change({maxDate: errorValue.requiredMaxDate});
    }
  },
  minDate: {
    key: 'err_min_date',
    replaceValues: (message: string, errorValue: any, fieldLabelText: string): string => {
      return message.change({minDate: errorValue.requiredMinDate});
    }
  }
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
  anyFieldsHasLength,
  getValidationData,
  defaultLengths,
  commonValidations,
  maxDate,
  minDate
};
