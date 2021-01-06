import {Injectable} from '@angular/core';
import {FactoryService} from './factory.service';
import {ConfigurationService} from './configuration.service';
import {IAppUrls} from '../interfaces/i-app-urls';
import {forEach as _forEach, some as _some} from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class UrlService {
  constructor(private config: ConfigurationService) {
    FactoryService.registerService('UrlService', this);
  }

  public URLS = {} as IAppUrls;

  static hasTrailingSlash(url: string): boolean {
    return ((url + '').indexOf('/')) === ((url + '').length - 1);
  }

  static hasPrefixSlash(url: string): boolean {
    return (url + '').indexOf('/') === 0;
  }

  static removeTrailingSlash(url: string): string {
    return UrlService.hasTrailingSlash(url) ? (url + '').substr(0, ((url + '').length - 1)) : url;
  }

  static removePrefixSlash(url: string): string {
    return UrlService.hasPrefixSlash(url) ? UrlService.removePrefixSlash((url + '').substr(1, (url + '').length)) : url;
  }

  public prepareUrls(urls: IAppUrls): IAppUrls {
    this.URLS.BASE_URL = UrlService.removeTrailingSlash(this.config.BASE_URL);
    _forEach(urls, (url: string, key: string) => {
      return key !== 'BASE_URL' && (this.URLS[key] = this.addBaseUrl(url));
    });
    return this.URLS;
  }

  private addBaseUrl(url: string): string {
    const external = _some(this.config.CONFIG.EXTERNAL_PROTOCOLS, (protocol) => {
      return url.toLowerCase().indexOf(protocol) === 0;
    });
    return external ? url : this.URLS.BASE_URL + '/' + UrlService.removePrefixSlash(url);
  }

}
