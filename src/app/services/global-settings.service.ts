import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {CrudGenericService} from '@app/generics/crud-generic-service';
import {GlobalSettings} from '@models/global-settings';
import {UrlService} from '@services/url.service';
import {FactoryService} from '@services/factory.service';
import {CastResponseContainer} from '@decorators/cast-response';

@CastResponseContainer({
  $default: {
    model: () => GlobalSettings
  }
})
@Injectable({
  providedIn: 'root'
})
export class GlobalSettingsService extends CrudGenericService<GlobalSettings> {
  list: GlobalSettings[] = [];

  constructor(public http: HttpClient,
              private urlService: UrlService) {
    super();
    FactoryService.registerService('GlobalSettingsService', this);
  }

  _getModel(): new () => GlobalSettings {
    return GlobalSettings;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.GLOBAL_SETTINGS;
  }
}
