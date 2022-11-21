import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'translateName'
})
export class TranslateNamePipe implements PipeTransform {

  constructor() {
  }

  transform(value: any, currentLang: string): string {
    if (currentLang === 'ar') {
      return value.arName;
    } else if (currentLang === 'en') {
      return value.enName;
    }
    return `NAME NOT EXISTS`;
  }

}
