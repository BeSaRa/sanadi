import {Styles} from '../enums/styles.enum';

export class Language {
  constructor(public  id: number, public  name: string, public code: string, public direction: string, public style: Styles) {
  }
}
