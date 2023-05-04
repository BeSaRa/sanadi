import {Injectable} from '@angular/core';
import {IAppConfig} from '@contracts/i-app-config';
import {FactoryService} from './factory.service';
import {range} from 'lodash';
import {Observable} from 'rxjs';
import {StaticAppResourcesService} from '@services/static-app-resources.service';
import {HttpClient} from '@angular/common/http';
import {ConfigurationMergingScope} from '@app/types/types';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  public BASE_URL = '';
  public CONFIG = {} as IAppConfig;
  static CURRENT_FULL_YEAR = (new Date()).getFullYear();

  constructor(private http: HttpClient,
              private staticResourcesService: StaticAppResourcesService) {
    FactoryService.registerService('ConfigurationService', this);
  }

  /**
   * @description Loads the configuration from CONFIGURATION.json to override the default application configuration
   */
  loadConfiguration(): Observable<IAppConfig> {
    return this.http.get<IAppConfig>('CONFIGURATION.json');
  }

  /**
   * @description Merge the default application configuration with overridden configuration
   * @param overridingConfig
   */
  mergeConfigurations(overridingConfig: Partial<IAppConfig>): IAppConfig {
    const mergingScope: ConfigurationMergingScope = this.staticResourcesService.getConfigurationMergeScope();
    let finalConfig: IAppConfig = this.staticResourcesService.getDefaultConfiguration() as IAppConfig;

    /**
     * if mergingScope = 'open', set all properties of final configuration as merge-able. Should be done after assigning final configuration
     * if mergingScope = 'limited | extended', set configurable properties as merge-able. Should be done after assigning final configuration
     */

    if (mergingScope === 'open') {
      for (const overrideKey in overridingConfig) {
        // @ts-ignore
        finalConfig[overrideKey] = overridingConfig[overrideKey];
      }
      this.staticResourcesService.setConfigurationMergingProperties(Object.keys(finalConfig) as Array<keyof IAppConfig>); // always set after finalConfig is set
    } else {
      const configurableProperties: Array<keyof IAppConfig> = this.staticResourcesService.getConfigurableProperties();

      for (const overrideKey in overridingConfig) {
        if (configurableProperties.includes(overrideKey as keyof IAppConfig)) {
          // @ts-ignore
          finalConfig[overrideKey] = overridingConfig[overrideKey];
        }
      }

      this.staticResourcesService.setConfigurationMergingProperties(configurableProperties);
    }
    return finalConfig;
  }

  public setConfigurations(configurations: IAppConfig): ConfigurationService {
    this.CONFIG = configurations;
    this.prepareBaseUrl();
    return this;
  }

  isBothLoginInstance(): boolean {
    return this.CONFIG.LOGIN_INSTANCE === 'BOTH';
  }

  isExternalLoginInstance(): boolean {
    return this.CONFIG.LOGIN_INSTANCE === 'EXTERNAL';
  }

  isInternalLoginInstance(): boolean {
    return this.CONFIG.LOGIN_INSTANCE === 'INTERNAL';
  }

  private prepareBaseUrl(): string {
    if (
      !this.CONFIG.hasOwnProperty('ENVIRONMENTS_URLS') ||
      !Object.keys(this.CONFIG.ENVIRONMENTS_URLS).length
    ) {
      throw Error('There is no ENVIRONMENTS_URLS Property or empty provided inside app-configuration.json file Kindly check it');
    }

    if (typeof this.CONFIG.BASE_ENVIRONMENT === 'undefined') {
      throw Error('there is no BASE_ENVIRONMENT_INDEX provided inside app-configuration.json file');
    }

    if (typeof this.CONFIG.ENVIRONMENTS_URLS[this.CONFIG.BASE_ENVIRONMENT] === 'undefined') {
      throw Error('the provided BASE_ENVIRONMENT not exists inside ENVIRONMENTS_URLS array in app-configuration.json file');
    }
    this.BASE_URL = this.CONFIG.ENVIRONMENTS_URLS[this.CONFIG.BASE_ENVIRONMENT];

    if (this.CONFIG.hasOwnProperty('API_VERSION') && this.CONFIG.API_VERSION) {
      if (this.BASE_URL.lastIndexOf('/') !== (this.BASE_URL.length - 1)) {
        this.BASE_URL += '/';
      }
      this.BASE_URL += this.CONFIG.API_VERSION;
    }
    return this.BASE_URL;
  }

  getSearchYears(): number[] {
    return this.CONFIG.SEARCH_YEARS_BY === 'RANGE' ?
      ConfigurationService.getYearsRange(this.CONFIG.SEARCH_YEARS_RANGE)
      : ConfigurationService.getYearsStart(this.CONFIG.SEARCH_YEARS_START);
  }

  private static getYearsRange(yearRange: number) {
    return range(ConfigurationService.CURRENT_FULL_YEAR, (ConfigurationService.CURRENT_FULL_YEAR - yearRange));
  }

  private static getYearsStart(startYear: number) {
    return range(startYear, ConfigurationService.CURRENT_FULL_YEAR + 1);
  }
}
