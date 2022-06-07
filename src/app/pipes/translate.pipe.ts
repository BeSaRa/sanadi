import { Pipe, PipeTransform } from '@angular/core';
import { ILanguageKeys } from "@contracts/i-language-keys";
import { LangService } from "@services/lang.service";

@Pipe({
  name: 'translate',
  pure: true
})
export class TranslatePipe implements PipeTransform {
  constructor(private lang: LangService) {}

  transform(value: keyof ILanguageKeys, currentLang: string): string {
    return this.lang.map[value] || `KEY NOT EXISTS ${value}`;
  }

}
