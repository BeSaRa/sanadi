import {IAngularMyDpOptions, IMyDate, IMyDateModel} from 'angular-mydatepicker';
import {IAppConfig} from '@contracts/i-app-config';
import {FactoryService} from '@services/factory.service';
import {ConfigurationService} from '@services/configuration.service';
import * as dayjs from 'dayjs';
import {IDatepickerCustomOptions} from '@contracts/i-datepicker-custom-options';
import {DatepickerControlsMap, DatepickerOptionsMap} from '@app/types/types';

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
    return dateValue.hasOwnProperty('singleDate') ? dateValue.singleDate?.jsDate : new Date(dateValue as unknown as Date);
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
      inputFieldValidation: true,
      divHostElement: {enabled: true, placeholder: ''},
      appendSelectorToBody: customOptions.appendToBody || false,
      openSelectorTopOfInput: customOptions.openSelectorTopOfInput || false
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
      };
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

  static removeDisablePeriod(datepickerOptions: IAngularMyDpOptions, period: 'past' | 'future' | 'all'): IAngularMyDpOptions {
    let optionsClone = DateUtils.getDatePickerOptionsClone(datepickerOptions);
    if (period === 'past') {
      delete optionsClone.disableUntil;
    } else if (period === 'future') {
      delete optionsClone.disableSince;
    } else if (period === 'all') {
      delete optionsClone.disableUntil;
      delete optionsClone.disableSince;
    }
    return optionsClone;
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

  static setRelatedMinMaxDate(options: {
    fromFieldName: string,
    toFieldName: string,
    controlOptionsMap: DatepickerOptionsMap,
    controlsMap: DatepickerControlsMap,
    disableSelectedFromRelated?: boolean
  }): void {
    DateUtils.setRelatedMaxDate(options);
    DateUtils.setRelatedMinDate(options);
  }

  /**
   * @description Set the min date for the "To" datepicker relative to "From" datepicker
   * @param options
   */
  static setRelatedMinDate(options: {
    fromFieldName: string,
    toFieldName: string,
    controlOptionsMap: DatepickerOptionsMap,
    controlsMap: DatepickerControlsMap,
    disableSelectedFromRelated?: boolean
  }) {
    setTimeout(() => {
      let toFieldDateOptions: IAngularMyDpOptions = this.getDatePickerOptionsClone(options.controlOptionsMap[options.toFieldName]);
      const fromDate = this.changeDateFromDatepicker(options.controlsMap[options.fromFieldName]?.value);
      if (!fromDate) {
        toFieldDateOptions.disableUntil = {year: 0, month: 0, day: 0};
      } else {
        const disableDate = new Date(fromDate);
        disableDate.setHours(0, 0, 0, 0); // set fromDate to start of day
        if (!options.disableSelectedFromRelated) {
          disableDate.setDate(disableDate.getDate() - 1);
        }
        toFieldDateOptions.disableUntil = {
          year: disableDate.getFullYear(),
          month: disableDate.getMonth() + 1,
          day: disableDate.getDate()
        };
      }
      options.controlOptionsMap[options.toFieldName] = toFieldDateOptions;
    }, 100);
  }

  /**
   * @description Set the max date for the "From" datepicker relative to "To" datepicker
   * @param options
   */
  static setRelatedMaxDate(options: {
    fromFieldName: string,
    toFieldName: string,
    controlOptionsMap: DatepickerOptionsMap,
    controlsMap: DatepickerControlsMap,
    disableSelectedFromRelated?: boolean
  }): void {
    setTimeout(() => {
      let fromFieldDateOptions: IAngularMyDpOptions = this.getDatePickerOptionsClone(options.controlOptionsMap[options.fromFieldName]);
      const toDate = this.changeDateFromDatepicker(options.controlsMap[options.toFieldName]?.value);
      if (!toDate) {
        fromFieldDateOptions.disableSince = {year: 0, month: 0, day: 0};
      } else {
        const disableDate = new Date(toDate);
        if (!options.disableSelectedFromRelated) {
          disableDate.setDate(disableDate.getDate() + 1);
        }
        fromFieldDateOptions.disableSince = {
          year: disableDate.getFullYear(),
          month: disableDate.getMonth() + 1,
          day: disableDate.getDate()
        };
      }
      options.controlOptionsMap[options.fromFieldName] = fromFieldDateOptions;
    }, 100);
  }

  static setStartOfDay(date: IMyDateModel | Date | string): any {
    if (!date) {
      return date;
    }
    return dayjs(DateUtils.changeDateFromDatepicker(date as unknown as IMyDateModel)).startOf('day');
  }

  static setEndOfDay(date: IMyDateModel | Date | string): any {
    if (!date) {
      return date;
    }
    return dayjs(DateUtils.changeDateFromDatepicker(date as unknown as IMyDateModel)).endOf('day');
  }

  static getTimeStampFromDate(date: IMyDateModel | Date | string): number | null {
    if (!date) {
      return null;
    }
    return DateUtils.changeDateFromDatepicker(date as unknown as IMyDateModel)?.valueOf() || null;
  }

  static getDifference(startDate: IMyDateModel | Date | string, endDate: IMyDateModel | Date | string, unit: 'day' | 'month' | 'year'): number {
    if (!startDate || !endDate || !unit) {
      return 0;
    }
    return (dayjs(DateUtils.getDateStringFromDate(endDate)).diff(DateUtils.getDateStringFromDate(startDate), unit));
  }

  static getHoursList(): { val: number, key: string }[] {
    return [
      {
        val: 2,
        key: '01:00 AM'
      },
      {
        val: 2,
        key: '02:00 AM'
      },
      {
        val: 3,
        key: '03:00 AM'
      },
      {
        val: 4,
        key: '04:00 AM'
      },
      {
        val: 5,
        key: '05:00 AM'
      },
      {
        val: 6,
        key: '06:00 AM'
      },
      {
        val: 7,
        key: '07:00 AM'
      },
      {
        val: 8,
        key: '08:00 AM'
      },
      {
        val: 9,
        key: '09:00 AM'
      },
      {
        val: 10,
        key: '10:00 AM'
      },
      {
        val: 11,
        key: '11:00 AM'
      },
      {
        val: 12,
        key: '12:00 AM'
      },
      {
        val: 13,
        key: '01:00 PM'
      },
      {
        val: 14,
        key: '02:00 PM'
      },
      {
        val: 15,
        key: '03:00 PM'
      },
      {
        val: 16,
        key: '04:00 PM'
      },
      {
        val: 17,
        key: '05:00 PM'
      },
      {
        val: 18,
        key: '06:00 PM'
      },
      {
        val: 19,
        key: '07:00 PM'
      },
      {
        val: 20,
        key: '08:00 PM'
      },
      {
        val: 21,
        key: '09:00 PM'
      },
      {
        val: 22,
        key: '10:00 PM'
      },
      {
        val: 23,
        key: '11:00 PM'
      },
      {
        val: 24,
        key: '12:00 PM'
      },
    ];
  }
  static getMinutesList(): { val: number, key: string }[] {
    return [
      {
        val: 1,
        key: '5 min'
      },
      {
        val: 2,
        key: '10 min'
      },
      {
        val: 3,
        key: '15 min'
      },
      {
        val: 4,
        key: '20 min'
      },
      {
        val: 5,
        key: '25 min'
      },
      {
        val: 6,
        key: '30 min'
      },
      {
        val: 7,
        key: '35 min'
      },
      {
        val: 8,
        key: '40 min'
      },
      {
        val: 9,
        key: '45 min'
      },
      {
        val: 10,
        key: '50 min'
      },
      {
        val: 11,
        key: '55 min'
      },
      {
        val: 12,
        key: '60 min'
      },
    ];
  }


  static getMillisecondsFromMinutes(minutes: number) {
    return minutes * 60 * 1000
  }

  static getYearMonthDayFromDate(date: IMyDateModel | Date | string): IMyDate | undefined {
    const typedDate = this.changeDateFromDatepicker(date as IMyDateModel);
    if (!typedDate) {
      return undefined;
    }
    return {
      year: typedDate.getFullYear(),
      month: typedDate.getMonth() + 1,
      day: typedDate.getDate()
    }
  }
}
