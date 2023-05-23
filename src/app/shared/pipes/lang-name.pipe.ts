import { Pipe, PipeTransform } from '@angular/core';
import { CommonUtils } from '@app/helpers/common-utils';

@Pipe({
  name: 'langName'
})
export class LangNamePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (!CommonUtils.isValidValue(value)) return '';

    return value.getName();
  }

}
