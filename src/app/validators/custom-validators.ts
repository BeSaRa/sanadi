import {
  maxlengthValidator as maxLength,
  minlengthValidator as minLength,
  numberValidator as number,
  decimalValidator as decimal,
  patternValidator as pattern,
  requiredValidator as required,
  requiredArrayValidator as requiredArray,
  validateFieldsStatus,
  validateSum,
  maxDateValidator as maxDate,
  minDateValidator as minDate,
  uniqueValidator as unique,
  validationPatterns
} from './validate-fields-status';
import {AbstractControl, ValidatorFn, Validators} from '@angular/forms';
import {IKeyValue} from '@contracts/i-key-value';
import {IValidationInfo} from '@contracts/i-validation-info';
import {anyFieldsHasLength} from './any-fields-has-length';
import {documentValidator as attachment} from './document-validator';
import {CommonUtils} from '@app/helpers/common-utils';
import {timeLaterThanOther} from './time-later-than-other';
import {timeEarlierThanOther} from './time-earlier-than-other';

const defaultLengths = {
  MIN_LENGTH: 3,
  ARABIC_NAME_MAX: 300,
  ENGLISH_NAME_MAX: 300,
  EMAIL_MAX: 200,
  PHONE_NUMBER_MAX: 20,
  ADDRESS_MAX: 1000,
  QID_MIN: 11,
  QID_MAX: 11,
  SWIFT_CODE_MIN: 8,
  SWIFT_CODE_MAX: 11,
  DECIMAL_PLACES: 2,
  EXPLANATIONS: 1200,
  _500: 500
};

const commonValidations = {
  qId: [number, minLength(defaultLengths.QID_MIN), maxLength(defaultLengths.QID_MAX)],
  passport: [pattern('ENG_NUM_ONLY'), maxLength(20)],
  gccId: [number, maxLength(20)],
  gccRId: [number, maxLength(20)],
  visa: [number, maxLength(20)],
  phone: [pattern('PHONE_NUMBER'), maxLength(defaultLengths.PHONE_NUMBER_MAX)],
  mobileNo: [pattern('PHONE_NUMBER'), maxLength(defaultLengths.PHONE_NUMBER_MAX)],
  fax: [number, maxLength(defaultLengths.PHONE_NUMBER_MAX)],
  decimalWithMinValue: (numberOfPlaces: number = 2, minValue?: number): ValidatorFn[] => {
    let minValueToSet = CommonUtils.isValidValue(minValue) ? minValue : _getDecimalMinValue(numberOfPlaces);
    return [decimal(numberOfPlaces), Validators.min(minValueToSet!)];
  }
};

const inputMaskPatterns = {
  NUMBER_ONLY: '0*',
  NUMBER_ONLY_WITH_LIMIT: (limit: number = 4, required: boolean = false): string => {
    return ''.padEnd(limit, required ? '0' : '9')
  },
  DECIMAL: (numberOfPlaces: number = 2): string => {
    // if numberOfPlaces < 1, use number mask instead of decimal
    if (numberOfPlaces < 1) {
      return '0*';
    }
    return '0*.' + ('0'.padEnd(numberOfPlaces, '0'));
  },
  /**
   * @description Used to mask for decimal with separator. ThousandSeparator should be used along with it
   * @param numberOfDecimalPlaces
   */
  DECIMAL_WITH_SEPARATOR: (numberOfDecimalPlaces: number = 2): string => {
    // if numberOfDecimalPlaces < 1, use number mask instead of decimal
    if (numberOfDecimalPlaces < 1) {
      return 'separator';
    }
    return 'separator.' + numberOfDecimalPlaces;
  },
  PERCENT: 'percent',
  SEPARATOR: 'separator',
  THOUSAND_SEPARATOR: ','
};

const errorKeys: IKeyValue = {
  required: {key: 'err_required_field', replaceValues: null},
  requiredArray: {key: 'err_required_field', replaceValues: null},
  email: {key: 'err_invalid_email', replaceValues: null},
  number: {key: 'err_number_only', replaceValues: null},
  decimal: {
    key: 'err_number_decimal_x_places',
    replaceValues: (message: string, errorValue: any, _fieldLabelKey: string): string => {
      return message.change({x: errorValue.numberOfPlaces});
    }
  },
  /*negativeDecimal: {
    key: 'err_number_negative_decimal_x_places',
    replaceValues: (message: string, errorValue: any, fieldLabelKey: string): string => {
      return message.change({x: errorValue.numberOfPlaces});
    }
  },*/
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
    replaceValues: (message: string, errorValue: any, _fieldLabelKey: string): string => {
      return message.change({min: errorValue.min});
    }
  },
  max: {
    key: 'err_max_number',
    replaceValues: (message: string, errorValue: any, _fieldLabelKey: string): string => {
      return message.change({max: errorValue.max});
    }
  },
  ENG_NUM: {key: 'err_english_num_only', replaceValues: null},
  AR_NUM: {key: 'err_arabic_num_only', replaceValues: null},
  ENG_ONLY: {key: 'err_english_only', replaceValues: null},
  AR_ONLY: {key: 'err_arabic_only', replaceValues: null},
  ENG_NUM_ONLY: {key: 'err_english_num_only', replaceValues: null},
  AR_NUM_ONLY: {key: 'err_arabic_num_only', replaceValues: null},
  ENG_NUM_ONE_ENG: {key: 'err_english_num_one_eng', replaceValues: null},
  AR_NUM_ONE_AR: {key: 'err_arabic_num_one_ar', replaceValues: null},
  ENG_AR_ONLY: {key: 'err_english_arabic_only', replaceValues: null},
  ENG_AR_NUM_ONLY: {key: 'err_english_arabic_num_only', replaceValues: null},
  ENG_NO_SPACES_ONLY: {key: 'err_english_no_space_only', replaceValues: null},
  PASSPORT: {key: 'err_invalid_passport_format', replaceValues: null},
  EMAIL: {key: 'err_invalid_email', replaceValues: null},
  PHONE_NUMBER: {key: 'err_invalid_phone_number', replaceValues: null},
  WEBSITE: {key: 'err_invalid_website', replaceValues: null},
  URL: {key: 'err_invalid_URL', replaceValues: null},
  keyExists: {key: 'localization_key_already_exists', replaceValues: null},
  profileCodeExists: {key: 'profile_code_already_exists', replaceValues: null},
  atLeastOneRequired: {
    key: 'at_least_one_field_should_be_filled',
    replaceValues: (message: string, errorValue: any, _fieldLabelKey: string): string => {
      return message.change({fields: '( ' + errorValue.join(', ') + ') '});
    }
  },
  format: {key: 'err_invalid_format', replaceValues: null},
  maxDate: {
    key: 'err_max_date',
    replaceValues: (message: string, errorValue: any, _fieldLabelText: string): string => {
      return message.change({maxDate: errorValue.requiredMaxDate});
    }
  },
  minDate: {
    key: 'err_min_date',
    replaceValues: (message: string, errorValue: any, _fieldLabelText: string): string => {
      return message.change({minDate: errorValue.requiredMinDate});
    }
  },
  unique: {key: 'err_unique_field', replaceValues: null},
  NUM_HYPHEN_COMMA: {key: 'err_num_hyphen_comma'},
  select_license: {key: 'err_missing_license', replaceValues: null},
  select_document: {key: 'err_missing_document', replaceValues: null},
  invalid_sum_total: {
    key: 'err_invalid_sum_total',
    replaceValues: (message: string, errorValue: any, _fieldLabelKey: string): string => {
      return message.change({
        expectedSum: errorValue.expectedSum,
        fields: errorValue.fieldLocalizationMap.map((local: any) => '<b>' + local.getName() + '</b>').join(', ')
      });
    }
  },
  invalidLaterTime: {key: 'err_invalid_later_time', replaceValues: null},
  invalidEarlierTime: {key: 'err_invalid_earlier_time', replaceValues: null},
  HAS_LETTERS: {key: 'err_must_have_letters', replaceValues: null},
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

function _getDecimalMinValue(numberOfPlaces: number) {
  return Number('.' + ('1'.padStart(numberOfPlaces, '0')));
}

export const CustomValidators = {
  validateFieldsStatus,
  validateSum,
  required,
  requiredArray,
  pattern,
  number,
  decimal,
  minLength,
  maxLength,
  anyFieldsHasLength,
  getValidationData,
  defaultLengths,
  commonValidations,
  maxDate,
  minDate,
  unique,
  inputMaskPatterns,
  validationPatterns,
  attachment,
  timeLaterThanOther,
  timeEarlierThanOther
};
