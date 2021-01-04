import {BaseModel} from './base-model';

export class Localization extends BaseModel {
  localizationKey: string | undefined;
  module: number | undefined;
}
