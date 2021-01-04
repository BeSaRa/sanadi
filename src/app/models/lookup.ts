import {BaseModel} from './base-model';

export class Lookup extends BaseModel {
  category: number | undefined;
  lookupKey: number | undefined;
  lookupStrKey: string | undefined;
  status: number | undefined;
  itemOrder: number | undefined;
  parent: number | undefined;
}
