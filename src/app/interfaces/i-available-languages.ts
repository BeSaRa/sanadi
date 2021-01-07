import {Language} from '../models/language';

export interface IAvailableLanguages {
  ar: Language;
  en: Language;

  [index: string]: Language;
}
