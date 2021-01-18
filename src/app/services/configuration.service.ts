import {Injectable} from '@angular/core';
import {IAppConfig} from '../interfaces/i-app-config';
import {FactoryService} from './factory.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  public BASE_URL = '';
  public CONFIG = {} as IAppConfig;

  constructor() {
    FactoryService.registerService('AppConfigurationService', this);
  }

  public setConfigurations(configurations: IAppConfig): ConfigurationService {
    this.CONFIG = configurations;
    this.prepareBaseUrl();
    return this;
  }

  private prepareBaseUrl(): string {
    if (
      !this.CONFIG.hasOwnProperty('ENVIRONMENTS_URLS') ||
      !this.CONFIG.ENVIRONMENTS_URLS.length
    ) {
      throw Error('There is no ENVIRONMENTS_URLS Property or empty provided inside app-configuration.json file Kindly check it');
    }

    if (typeof this.CONFIG.BASE_ENVIRONMENT_INDEX === 'undefined') {
      throw Error('there is no BASE_ENVIRONMENT_INDEX provided inside app-configuration.json file');
    }

    if (typeof this.CONFIG.ENVIRONMENTS_URLS[this.CONFIG.BASE_ENVIRONMENT_INDEX] === 'undefined') {
      throw Error('the provided BASE_ENVIRONMENT_INDEX not exists inside ENVIRONMENTS_URLS array in app-configuration.json file');
    }
    this.BASE_URL = this.CONFIG.ENVIRONMENTS_URLS[this.CONFIG.BASE_ENVIRONMENT_INDEX];

    if (this.CONFIG.hasOwnProperty('API_VERSION') && this.CONFIG.API_VERSION) {
      if (this.BASE_URL.lastIndexOf('/') !== (this.BASE_URL.length - 1)) {
        this.BASE_URL += '/';
      }
      this.BASE_URL += this.CONFIG.API_VERSION;
    }
    return this.BASE_URL;
  }
}
