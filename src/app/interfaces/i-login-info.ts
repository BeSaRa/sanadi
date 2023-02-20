import { GlobalSettings } from '@app/models/global-settings';
import {Localization} from '../models/localization';
import {ILookupMap} from './i-lookup-map';

export interface ILoginInfo {
  localizationSet: Localization[];
  lookupMap: ILookupMap;
  globalSetting:GlobalSettings;
}
