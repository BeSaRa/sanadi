import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {GlobalSettings} from '@models/global-settings';

export class GlobalSettingsInterceptor implements IModelInterceptor<GlobalSettings> {
  send(model: Partial<GlobalSettings>): Partial<GlobalSettings> {
    model.fileType = JSON.stringify(model.fileTypeArr);
    return model;
  }

  receive(model: GlobalSettings): GlobalSettings {
    let fileTypeArr: number[];
    try {
      fileTypeArr = JSON.parse(model.fileType);
    }
    catch (err) {
      fileTypeArr = [];
    }
    model.fileTypeArr = fileTypeArr;

    return model;
  }
}
