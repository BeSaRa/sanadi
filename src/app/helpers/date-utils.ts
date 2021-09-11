import {IAngularMyDpOptions, IMyDateModel} from 'angular-mydatepicker';
import {IAppConfig} from '../interfaces/i-app-config';
import {FactoryService} from '../services/factory.service';
import {ConfigurationService} from '../services/configuration.service';
import * as dayjs from 'dayjs';
import {IDatepickerCustomOptions} from '../interfaces/i-datepicker-custom-options';

export class DateUtils {
  static changeDateToDatepicker(dateValue: any): IMyDateModel {
    if (!dateValue || dateValue.hasOwnProperty('singleDate')) {
      return dateValue;
    }
    return {isRange: false, singleDate: {jsDate: new Date(dateValue)}, dateRange: undefined};
  }

  static changeDateFromDatepicker(dateValue: IMyDateModel): (Date | undefined) {
    if (!dateValue) {
      return dateValue;
    }
    return dateValue.singleDate?.jsDate;
  }

  static getDateStringFromDate(dateValue: any, format: (keyof IAppConfig) = {} as keyof IAppConfig): string {
    if (!dateValue) {
      return '';
    }
    const configService = FactoryService.getService<ConfigurationService>('ConfigurationService');
    let typeCastFormat = (configService.CONFIG[format] || configService.CONFIG.DATEPICKER_FORMAT) as string;

    if (typeof dateValue === 'string') {
      return dayjs(dateValue).format(typeCastFormat);
    }

    let date = dateValue;
    if (date.hasOwnProperty('singleDate')) {
      date = date.singleDate.hasOwnProperty('jsDate') ? date.singleDate.jsDate : date.singleDate;
    }
    return dayjs(date).format(typeCastFormat);
  }

  private static _getDatepickerDisableDate(customOptions: IDatepickerCustomOptions): Date {
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

  static getDatepickerOptions(customOptions: IDatepickerCustomOptions): IAngularMyDpOptions {
    const configService = FactoryService.getService<ConfigurationService>('ConfigurationService');
    const format = customOptions.format || configService.CONFIG.DATEPICKER_FORMAT;

    let options: IAngularMyDpOptions = {
      dateRange: false,
      dateFormat: format.toLowerCase(),
      inputFieldValidation: false,
      divHostElement: {enabled: true, placeholder: ''}
    };
    if (customOptions.disablePeriod === 'none') {
      return options;
    }
    const disableDate = this._getDatepickerDisableDate(customOptions);
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
    return options;
  }

  static getDatePickerOptionsClone(datepickerOptions: IAngularMyDpOptions): IAngularMyDpOptions {
    return JSON.parse(JSON.stringify(datepickerOptions));
  }

  /**
   * @description Compares if given date is greater than other date.
   * Both dates should have same format
   * @param dateToCheck
   * @param dateToCompare
   */
  static isGreaterThan(dateToCheck: any, dateToCompare: any): boolean {
    return dayjs(dateToCheck).isAfter(dayjs(dateToCompare));
  }

  /**
   * @description Compares if given date is less than other date.
   * Both dates should have same format
   * @param dateToCheck
   * @param dateToCompare
   */
  static isLessThan(dateToCheck: any, dateToCompare: any): boolean {
    return dayjs(dateToCheck).isBefore(dayjs(dateToCompare));
  }
}
