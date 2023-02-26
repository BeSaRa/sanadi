import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {GlobalSettings} from '@models/global-settings';

export class GlobalSettingsInterceptor implements IModelInterceptor<GlobalSettings> {
  send(model: Partial<GlobalSettings>): Partial<GlobalSettings> {
    model.fileType = JSON.stringify(model.fileTypeArr);

    GlobalSettingsInterceptor._deleteBeforeSend(model);
    return model;
  }

  receive(model: GlobalSettings): GlobalSettings {
    GlobalSettingsInterceptor.parseFileTypes(model);

    return model;
  }

  static parseFileTypes(model: GlobalSettings): void {
    let fileTypeArr: number[];
    try {
      fileTypeArr = JSON.parse(model.fileType);
    } catch (err) {
      fileTypeArr = [];
    }
    model.fileTypeArr = fileTypeArr;
  }

  static _deleteBeforeSend(model: Partial<GlobalSettings>): void {
    delete model.fileTypeArr;
  }
}
