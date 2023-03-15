import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { hasValidLength, isValidValue } from '@helpers/utils';
import { customValidationTypes } from '../types/types';
import * as dayjs from 'dayjs';
import { FactoryService } from '@services/factory.service';
import { ConfigurationService } from '@services/configuration.service';
import { some as _some } from 'lodash';
import { CommonUtils } from '@app/helpers/common-utils';

export const validationPatterns: any = {
  ENG_NUM: new RegExp(/^[a-zA-Z0-9\- ]+$/),
  AR_NUM: new RegExp(/^[\u0621-\u064A0-9\u0660-\u0669\- ]+$/),
  ENG_ONLY: new RegExp(/^[a-zA-Z ]+$/),
  AR_ONLY: new RegExp(/^[\u0621-\u064A ]+$/),
  ENG_NUM_ONLY: new RegExp(/^[a-zA-Z0-9]+$/),
  AR_NUM_ONLY: new RegExp(/^[\u0621-\u064A0-9\u0660-\u0669]+$/),
  ENG_NUM_ONE_ENG: new RegExp(/^(?=.*[a-zA-Z])([a-zA-Z0-9\- ]+)$/),
  AR_NUM_ONE_AR: new RegExp(/^(?=.*[\u0621-\u064A])([\u0621-\u064A0-9\u0660-\u0669\- ]+)$/),
  ENG_AR_ONLY: new RegExp(/^[a-zA-Z\u0621-\u064A ]+$/),
  ENG_AR_NUM_ONLY: new RegExp(/^[a-zA-Z\u0621-\u064A0-9\u0660-\u0669 ]+$/),
  ENG_NO_SPACES_ONLY: new RegExp(/^[a-zA-Z]+$/),
  PASSPORT: new RegExp('^[A-Z][0-9]{8,}$'),
  EMAIL: new RegExp(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)])/),
  NUM_HYPHEN_COMMA: new RegExp('^(?=.*?[1-9])[0-9-,._]+$'),
  // PHONE_NUMBER: new RegExp('^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$','gmi')
  PHONE_NUMBER: new RegExp(/^[+]?[0-9]+$/),
  WEBSITE: new RegExp(/^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/),
  URL: new RegExp('http(s)?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}', 'ig'),
  HAS_LETTERS:new RegExp(/^[\u0621-\u064A0-9\u0660-\u0669\u0621-\u064Aa-zA-Z0-9]*[\u0621-\u064Aa-zA-Z ]/)

};

export function validateFieldsStatus(fields: string[]): ValidatorFn {
  return (formGroup): ValidationErrors | null => {
    const isInvalid = fields.some((fieldName: string) => {
      return formGroup.get(fieldName)?.invalid;
    });
    return isInvalid ? {required: true} : null;
  };
}

export function validateSum(expectedSum: number, numberOfPlaces: number, fields: string[], fieldLocalizationMap: any[]): ValidatorFn {
  return (formGroup): ValidationErrors | null => {
    let sum = 0;
    fields.map((fieldName: string) => {
      let control = formGroup.get(fieldName), value = control?.value || 0;
      if (value && CommonUtils.isValidValue(value) && !isNaN(value)) {
        value = (numberOfPlaces === 0 ? Number(value) : Number(Number(value).toFixed(numberOfPlaces)));
      }
      sum += value;
      return fieldName;
    });
    sum = (numberOfPlaces === 0) ? sum : Number(sum.toFixed(numberOfPlaces));
    expectedSum = (numberOfPlaces === 0) ? expectedSum : Number(expectedSum.toFixed(numberOfPlaces));
    return (expectedSum === sum) ? null : {invalid_sum_total: {fields, fieldLocalizationMap, expectedSum}};
  };
}

export function numberValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }
  const isValid = (/^[0-9\u0660-\u0669]+$/g).test(control.value);
  return !isValid ? {number: true} : null;
}

export function decimalValidator(numberOfPlaces: number = 2): ValidatorFn {// , allowNegative: boolean = false
  if (!CommonUtils.isValidValue(numberOfPlaces)) {
    return Validators.nullValidator;
  }
  return (control: AbstractControl): ValidationErrors | null => {
    if (!isValidValue(control.value)) {
      return null;
    }

    let decimalPattern = `^([0-9\u0660-\u0669]*)(\.[0-9\u0660-\u0669]{1,${numberOfPlaces}})?$`;
    const isValid = new RegExp(decimalPattern).test(control.value);
    return isValid ? null : {decimal: {numberOfPlaces: numberOfPlaces}};

    /*let decimalPattern = `^([0-9\u0660-\u0669]*)(\.[0-9\u0660-\u0669]{1,${numberOfPlaces}})?$`,
      negativeDecimalPattern = `^-?([0-9\u0660-\u0669]*)(\.[0-9\u0660-\u0669]{1,${numberOfPlaces}})?$`,
      decimalError = {decimal: {numberOfPlaces: numberOfPlaces}},
      negativeDecimalError = {negativeDecimal: {numberOfPlaces: numberOfPlaces}};

    const isValid = new RegExp(allowNegative ? negativeDecimalPattern : decimalPattern).test(control.value);
    return isValid ? null : (allowNegative ? negativeDecimalError : decimalError);*/
  };
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

export function requiredArrayValidator(control: AbstractControl): ValidationErrors | null {
  return (!isValidValue(control.value) || control.value.length === 0) ? {requiredArray: true} : null;
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

    const unique = _some(data, function (row) {
      if (editObj) {
        return (editObj[property] + '').toLowerCase() !== (row[property] + '').toLowerCase() &&
          (row[property] + '').toLowerCase() === control.value.toLowerCase();
      }
      return (row[property] + '').toLowerCase() === control.value.toLowerCase();
    });
    return unique ? {unique: {value: control.value}} : null;
  });
}
