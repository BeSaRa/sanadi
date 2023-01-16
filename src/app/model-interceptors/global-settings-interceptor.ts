import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {GlobalSettings} from '@models/global-settings';

export class GlobalSettingsInterceptor implements IModelInterceptor<GlobalSettings> {
  send(model: Partial<GlobalSettings>): Partial<GlobalSettings> {
    return model;
  }

  receive(model: GlobalSettings): GlobalSettings {
    return model;
  }
}
