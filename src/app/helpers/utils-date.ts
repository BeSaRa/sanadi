import {IAngularMyDpOptions, IMyDateModel} from 'angular-mydatepicker';
import {IAppConfig} from '../interfaces/i-app-config';
import {FactoryService} from '../services/factory.service';
import {ConfigurationService} from '../services/configuration.service';
import * as dayjs from 'dayjs';
import {IDatepickerCustomOptions} from '../interfaces/i-datepicker-custom-options';

export {
  changeDateToDatepicker,
  changeDateFromDatepicker,
  getDateStringFromDate,
  getDatepickerOptions,
  getDatePickerOptionsClone
};

function changeDateToDatepicker(dateValue: any): IMyDateModel {
  if (!dateValue) {
    return dateValue;
  }
  return {isRange: false, singleDate: {jsDate: new Date(dateValue)}, dateRange: undefined};
}

function changeDateFromDatepicker(dateValue: IMyDateModel): (Date | undefined) {
  if (!dateValue) {
    return dateValue;
  }
  return dateValue.singleDate?.jsDate;
}

function getDateStringFromDate(dateValue: any, format: (keyof IAppConfig) = {} as keyof IAppConfig): string {
  if (!dateValue) {
    return dateValue;
  }
  const configService = FactoryService.getService<ConfigurationService>('ConfigurationService');
  let typeCastFormat = configService.CONFIG[format] || configService.CONFIG.DATEPICKER_FORMAT;

  if (typeof dateValue === 'string') {
    // @ts-ignore
    return dayjs(dateValue).format(typeCastFormat);
  }

  let date = dateValue;
  if (date.hasOwnProperty('singleDate')) {
    date = date.singleDate.hasOwnProperty('jsDate') ? date.singleDate.jsDate : date.singleDate;
  }
  // @ts-ignore
  return dayjs(date).format(typeCastFormat);
}

function _getDatepickerDisableDate(customOptions: IDatepickerCustomOptions): Date {
  let disableDate = new Date(), skipDays = 1; //skipDays = 1 to ignore today when disabling

  // if ignoreDays is passed, disableToday will be ignored and only ignoreDays will be used
  if (customOptions.ignoreDays && customOptions.ignoreDays > 0) {
    skipDays = customOptions.ignoreDays;
  } else if (customOptions.disableToday) {
    skipDays = 0;
  }
  if (skipDays > 0) {
    if (customOptions.disablePeriod === 'past') {
      disableDate.setDate(disableDate.getDate() - skipDays);
    } else if (customOptions.disablePeriod === 'future') {
      disableDate.setDate(disableDate.getDate() + skipDays);
    }
  }
  return disableDate;
}

/**
 * @description Get date picker options for angularMyDatepicker
 * @param customOptions
 */
function getDatepickerOptions(customOptions: IDatepickerCustomOptions): IAngularMyDpOptions {
  const configService = FactoryService.getService<ConfigurationService>('ConfigurationService');
  const format = customOptions.format || configService.CONFIG.DATEPICKER_FORMAT;

  let options: IAngularMyDpOptions = {
    dateRange: false,
    dateFormat: format.toLowerCase(),
    inputFieldValidation: false
  };
  if (customOptions.disablePeriod === 'none') {
    return options;
  }
  const disableDate = _getDatepickerDisableDate(customOptions);
  if (customOptions.disablePeriod === 'past') {
    options.disableUntil = {
      year: disableDate.getFullYear(),
      month: disableDate.getMonth() + 1,
      day: disableDate.getDate()
    }
  } else if (customOptions.disablePeriod === 'future') {
    options.disableSince = {
      year: disableDate.getFullYear(),
      month: disableDate.getMonth() + 1,
      day: disableDate.getDate()
    };
  }
  if (customOptions.readonly) {
    options.divHostElement = {enabled: true, placeholder: ''}
  }
  return options;
}

function getDatePickerOptionsClone(datepickerOptions: IAngularMyDpOptions): IAngularMyDpOptions {
  return JSON.parse(JSON.stringify(datepickerOptions));
}
