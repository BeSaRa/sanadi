import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {CrudGenericService} from '@app/generics/crud-generic-service';
import {GlobalSettings} from '@models/global-settings';
import {UrlService} from '@services/url.service';
import {FactoryService} from '@services/factory.service';
import {CastResponse, CastResponseContainer} from '@decorators/cast-response';
import {Observable} from 'rxjs';
import {FileType} from '@models/file-type';

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

  @CastResponse(() => FileType, {
    unwrap: 'rs',
    fallback: '$default'
  })
  _getFileTypes(): Observable<FileType[]> {
    return this.http.get<FileType[]>(this._getServiceURL() + '/file-types');
  }

  getFileTypes(): Observable<FileType[]> {
    return this._getFileTypes();
  }
}
