import {Cloneable} from './cloneable';

export class CustomProperty extends Cloneable<CustomProperty>{
  name!: string;
  bindKey!: string;
  values: any[] = [];
}
