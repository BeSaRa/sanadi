import {Cloneable} from './cloneable';
import { CustomPropertyTypes } from "@app/enums/custom-property-types";

export class CustomProperty extends Cloneable<CustomProperty>{
  name!: string;
  bindKey!: string;
  values: any[] = [];
  type!: CustomPropertyTypes
}
