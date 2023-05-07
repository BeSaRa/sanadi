import {ILoginInfo} from '@contracts/i-login-info';
import {Localization} from '@models/localization';
import {Lookup} from '@models/lookup';
import {ILookupMap} from '@contracts/i-lookup-map';
import {LocalizationInterceptor} from './localization-interceptor';
import {GlobalSettingsInterceptor} from '@model-interceptors/global-settings-interceptor';
import {GlobalSettings} from '@models/global-settings';

const localizationInterceptor = new LocalizationInterceptor();

export function interceptLoginInfo(model: ILoginInfo): ILoginInfo {
  model.localizationSet = model.localizationSet.map(item => {
    return localizationInterceptor.receive(Object.assign(new Localization(), item));
  });
  model.globalSetting = new GlobalSettingsInterceptor().receive(Object.assign(new GlobalSettings(), model.globalSetting));

  for (const lookupMapKey in model.lookupMap) {
    if (model.lookupMap.hasOwnProperty(lookupMapKey)) {
      const key = lookupMapKey as keyof ILookupMap;
      model.lookupMap[key] = model.lookupMap[key].map((item: any) => {
        return Object.assign(new Lookup(), item);
      });
    }
  }
  return model;
}
