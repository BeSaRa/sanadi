import { Pipe, PipeTransform } from '@angular/core';
import { CommonUtils } from '@app/helpers/common-utils';

@Pipe({
  name: 'langName'
})
export class LangNamePipe implements PipeTransform {

  transform(value: any, funcName?:string): any {
    if (!CommonUtils.isValidValue(value)) return '';
    if(funcName) return value[funcName]()
    return value.getName();
  }

}
