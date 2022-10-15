import {Injectable} from '@angular/core';
import {FactoryService} from './factory.service';
import {ConfigurationService} from './configuration.service';
import {IAppUrls} from '@contracts/i-app-urls';
import {Observable} from 'rxjs';
import {StaticAppResourcesService} from '@services/static-app-resources.service';

@Injectable({
  providedIn: 'root'
})
export class UrlService {
  constructor(private config: ConfigurationService,
              private staticResourcesService: StaticAppResourcesService) {
    FactoryService.registerService('UrlService', this);
  }

  public URLS = {} as IAppUrls;
  public previousPath: string = '';
  public currentPath: string = '';

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

  loadUrls(): Observable<IAppUrls> {
    return this.staticResourcesService.getUrls();
  }

  public prepareUrls(urls: IAppUrls): IAppUrls {
    this.URLS.BASE_URL = UrlService.removeTrailingSlash(this.config.BASE_URL);
    for (const key in urls) {
      if (urls[key] !== 'BASE_URL') {
        this.URLS[key] = this.addBaseUrl(urls[key]);
      }
    }
    return this.URLS;
  }

  private addBaseUrl(url: string): string {
    const external = (this.config.CONFIG.EXTERNAL_PROTOCOLS ?? []).some((protocol) => {
      return url.toLowerCase().indexOf(protocol) === 0;
    });
    return external ? url : this.URLS.BASE_URL + '/' + UrlService.removePrefixSlash(url);
  }

}
