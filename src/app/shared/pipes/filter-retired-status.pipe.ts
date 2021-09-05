import { Pipe, PipeTransform } from '@angular/core';
import {Lookup} from '@app/models/lookup';
import {CommonStatusEnum} from '@app/enums/common-status.enum';

@Pipe({
  name: 'filterRetiredStatus'
})
export class FilterRetiredStatusPipe implements PipeTransform {

  transform(value: Lookup[]): Lookup[] {
    if(!value || value.length === 0) {
      return value;
    }

    return value.filter(model => {
      return model.lookupKey !== CommonStatusEnum.RETIRED;
    });
  }

}
