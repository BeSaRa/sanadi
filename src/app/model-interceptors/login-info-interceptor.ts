import {ILoginInfo} from '../interfaces/i-login-info';
import {Localization} from '../models/localization';
import {Lookup} from '../models/lookup';
import {ILookupMap} from '../interfaces/i-lookup-map';

export function interceptLoginInfo(model: { rs: ILoginInfo }): ILoginInfo {
  model.rs.localizationSet = model.rs.localizationSet.map(item => {
    return Object.assign(new Localization(), item);
  });

  for (const lookupMapKey in model.rs.lookupMap) {
    if (model.rs.lookupMap.hasOwnProperty(lookupMapKey)) {
      const key = lookupMapKey as keyof ILookupMap;
      model.rs.lookupMap[key] = model.rs.lookupMap[key].map((item: any) => {
        return Object.assign(new Lookup(), item);
      });
    }
  }
  return model.rs;
}
