import {AbstractControl, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {hasValidLength, isValidValue} from '../helpers/utils';
import {customValidationTypes} from '../types/types';
import * as dayjs from 'dayjs';
import {FactoryService} from '../services/factory.service';
import {ConfigurationService} from '../services/configuration.service';
import {some as _some} from 'lodash';

export const validationPatterns: any = {
  ENG_NUM: new RegExp(/^[a-zA-Z0-9\- ]+$/),
  AR_NUM: new RegExp(/^[\u0621-\u064A0-9\u0660-\u0669\- ]+$/),
  ENG_ONLY: new RegExp(/^[a-zA-Z ]+$/),
  AR_ONLY: new RegExp(/^[\u0621-\u064A ]+$/),
  ENG_NUM_ONLY: new RegExp(/^[a-zA-Z0-9]+$/),
  AR_NUM_ONLY: new RegExp(/^[\u0621-\u064A0-9\u0660-\u0669]+$/),
  ENG_AR_ONLY: new RegExp(/^[a-zA-Z\u0621-\u064A ]+$/),
  ENG_AR_NUM_ONLY: new RegExp(/^[a-zA-Z\u0621-\u064A0-9\u0660-\u0669 ]+$/),
  PASSPORT: new RegExp("^[A-Z][0-9]{8,}$"),
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
    let isInvalid: boolean, valueLength: number;
    if (typeof control.value === 'string') {
      valueLength = control.value.trim().length;
    } else if (typeof control.value === 'number') {
      valueLength = ('' + control.value).trim().length;
    } else {
      valueLength = control.value.length;
    }
    isInvalid = (valueLength > maxLength);
    return isInvalid ? {maxlength: {requiredLength: maxLength, actualLength: valueLength}} : null;
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
    let isInvalid: boolean, valueLength: number;
    if (typeof control.value === 'string') {
      valueLength = control.value.trim().length;
    } else if (typeof control.value === 'number') {
      valueLength = ('' + control.value).trim().length;
    } else {
      valueLength = control.value.length;
    }
    isInvalid = (valueLength < minLength);
    return isInvalid ? {minlength: {requiredLength: minLength, actualLength: valueLength}} : null;
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

export function maxDateValidator(maxDate: string | Date, format: string = ''): ValidatorFn {
  if (!maxDate || !isValidValue(maxDate)) {
    return Validators.nullValidator;
  }
  return (control: AbstractControl): ValidationErrors | null => {
    let value = control.value;
    if (!isValidValue(value)) {
      return null;
    }

    if (value.hasOwnProperty('singleDate')) {
      value = value.singleDate.hasOwnProperty('jsDate') ? value.singleDate.jsDate : value.singleDate;
    }

    value = typeof value === 'string' ? value.trim() : value;

    const configService = FactoryService.getService<ConfigurationService>('ConfigurationService');
    format = format || configService.CONFIG.DATEPICKER_FORMAT;

    const formattedControlValue = dayjs(value).format(format);
    if (formattedControlValue === 'Invalid Date' || dayjs(value, format).isAfter(dayjs(maxDate, format))) {
      return {
        maxDate: {
          invalidDateFormat: formattedControlValue === 'Invalid Date',
          requiredMaxDate: formattedControlValue === 'Invalid Date' ? '' : dayjs(maxDate).format(format),
          actualMaxDate: value
        }
      };
    }
    return null;
  };
}

export function minDateValidator(minDate: string | Date, format: string = ''): ValidatorFn {
  if (!minDate || !isValidValue(minDate)) {
    return Validators.nullValidator;
  }
  return (control: AbstractControl): ValidationErrors | null => {
    let value = control.value;
    if (!isValidValue(value)) {
      return null;
    }
    if (value.hasOwnProperty('singleDate')) {
      value = value.singleDate.hasOwnProperty('jsDate') ? value.singleDate.jsDate : value.singleDate;
    }

    value = typeof value === 'string' ? value.trim() : value;

    const configService = FactoryService.getService<ConfigurationService>('ConfigurationService');
    format = format || configService.CONFIG.DATEPICKER_FORMAT;

    const formattedControlValue = dayjs(value).format(format);
    if (formattedControlValue === 'Invalid Date' || dayjs(value, format).isBefore(dayjs(minDate, format))) {
      return {
        minDate: {
          invalidDateFormat: formattedControlValue === 'Invalid Date',
          requiredMinDate: formattedControlValue === 'Invalid Date' ? '' : dayjs(minDate).format(format),
          actualMinDate: value
        }
      };
    }
    return null;
  };
}

export function uniqueValidator<T>(data: T[], property: keyof T, editObj: T): ValidatorFn {
  return ((control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const unique = _some(data, function(row) {
      if (editObj) {
        return (editObj[property] + '').toLowerCase() !== (row[property] + '').toLowerCase() &&
          (row[property] + '').toLowerCase() === control.value.toLowerCase();
      }
      return (row[property] + '').toLowerCase() === control.value.toLowerCase();
    });
    return unique ? {unique: {value: control.value}} : null;
  });
}
