import {Localization} from '../models/localization';
import {Lookup} from '../models/lookup';

export interface ILoginInfo {
  localizationSet: Localization[];
  lookupMap: {
    AidType: Lookup[],
    Nationality: Lookup[],
    OrgStatus: Lookup[],
    OrgUnitType: Lookup[],
    OrgUserJobTitle: Lookup[],
    OrgUserPermissionGroup: Lookup[],
    OrgUserStatus: Lookup[],
    OrgUserType: Lookup[],
    SubAidPeriodicType: Lookup[]
  };
}
