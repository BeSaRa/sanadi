import {Lookup} from '@app/models/lookup';

export interface MenuUrlValueContract {
  name: string;
  value?: number;
  valueLookups: Lookup[];
}
