import {ILoginInfo} from '../interfaces/i-login-info';
import {Localization} from '../models/localization';

export function interceptLoginInfo(model: { rs: ILoginInfo }): ILoginInfo {
  model.rs.localizationSet = model.rs.localizationSet.map(item => {
    return Object.assign(new Localization(), item);
  });
  return model.rs;
}
