import {ILoginInfo, ILookupMap} from '../interfaces/i-login-info';
import {Localization} from '../models/localization';
import {Lookup} from '../models/lookup';

export function interceptLoginInfo(model: { rs: ILoginInfo }): ILoginInfo {
  model.rs.localizationSet = model.rs.localizationSet.map(item => {
    return Object.assign(new Localization(), item);
  });

  for (const lookupMapKey in model.rs.lookupMap) {
    if (model.rs.lookupMap.hasOwnProperty(lookupMapKey)) {
      const key = lookupMapKey as keyof ILookupMap;
      model.rs.lookupMap[key] = model.rs.lookupMap[key].map(item => {
        return Object.assign(new Lookup(), item);
      });
    }
  }
  return model.rs;
}
