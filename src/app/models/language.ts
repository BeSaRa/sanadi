import {Styles} from '../enums/styles.enum';
import {Direction} from '@angular/cdk/bidi';

export class Language {
  constructor(public  id: number, public  name: string, public code: string, public direction: Direction, public style: Styles, public toggleTo: string) {
  }
}
