import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {GlobalSettings} from '@models/global-settings';
import {CommonUtils} from '@helpers/common-utils';

export class GlobalSettingsInterceptor implements IModelInterceptor<GlobalSettings> {
  send(model: Partial<GlobalSettings>): Partial<GlobalSettings> {
    GlobalSettingsInterceptor.stringifyFileTypes(model);
    GlobalSettingsInterceptor.stringifyEmailList(model);

    GlobalSettingsInterceptor._deleteBeforeSend(model);
    return model;
  }

  receive(model: GlobalSettings): GlobalSettings {
    GlobalSettingsInterceptor.parseFileTypes(model);
    GlobalSettingsInterceptor.parseEmailsList(model);

    return model;
  }

  private static parseFileTypes(model: GlobalSettings): void {
    try {
      model.fileTypeParsed = JSON.parse(model.fileType);
    } catch (err) {
      model.fileTypeParsed = [];
    }
  }

  private static stringifyFileTypes(model: Partial<GlobalSettings>): void {
    model.fileType = JSON.stringify((model.fileTypeParsed ?? []).filter((fileType) => CommonUtils.isValidValue(fileType)));
  }

  private static parseEmailsList(model: GlobalSettings) {
    try {
      model.supportEmailListParsed = JSON.parse(model.supportEmailList);
    } catch (e) {
      model.supportEmailListParsed = [];
    }
  }

  private static stringifyEmailList(model: Partial<GlobalSettings>) {
    model.supportEmailList = JSON.stringify((model.supportEmailListParsed ?? []).filter((email) => CommonUtils.isValidValue(email)));
  }

  static _deleteBeforeSend(model: Partial<GlobalSettings>): void {
    delete model.fileTypeParsed;
    delete model.supportEmailListParsed;
  }
}
