import {FactoryService} from '@services/factory.service';
import {StaticAppResourcesService} from '@services/static-app-resources.service';
import {IAppConfig} from '@contracts/i-app-config';

String.prototype.change = function(): string {
  if (!arguments.length) {
    return String(this);
  }

  let updatedText: string = String(this);

  for (const key in arguments[0]) {
    if (arguments[0].hasOwnProperty(key)) {
      const value = (typeof arguments[0][key] !== undefined && arguments[0][key] !== null) ? arguments[0][key] : '';
      const regex = new RegExp(':' + key, 'g');
      const regex2 = new RegExp('{{' + key + '}}', 'g');
      const regex3 = new RegExp('{' + key + '}', 'g');
      updatedText = updatedText.replace(regex, value);
      updatedText = updatedText.replace(regex2, value);
      updatedText = updatedText.replace(regex3, value);
    }
  }
  return updatedText;
};

String.prototype.getExtension = function (): string {
  const name: string = String(this);
  return name.substring(name.lastIndexOf('.'));
}

Window.prototype.getConfigMergeProperties = function (): {scope: string, properties: Array<keyof IAppConfig>} {
  const service = FactoryService.getService<StaticAppResourcesService>('StaticAppResourcesService');
  return !service ? {} as any : service.getConfigurablePropertiesForConsole();
}

Window.prototype.getPrivateBuild = function (): string {
  const service = FactoryService.getService<StaticAppResourcesService>('StaticAppResourcesService');
  return !service ? '' : service.getPrivateBuildForConsole();
}
