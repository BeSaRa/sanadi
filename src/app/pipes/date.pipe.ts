import {Inject, LOCALE_ID, Pipe, PipeTransform} from '@angular/core';
import {formatDate} from '@angular/common';
import {DateUtils} from '@helpers/date-utils';
import {IMyDateModel} from '@nodro7/angular-mydatepicker';
import {CommonUtils} from '@helpers/common-utils';

@Pipe({
  name: 'date',
  pure: true
})
export class DatePipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private locale: string) {
  }

  transform(value: Date | string | number | IMyDateModel | null | undefined, format: string = 'mediumDate'): string {
    if (!CommonUtils.isValidValue(value) || value !== value) {
      return '';
    }

    try {
      return formatDate((DateUtils.changeDateFromDatepicker(value as unknown as IMyDateModel) || ''), format, this.locale);
    } catch (error) {
      return '';
    }
  }

}
