import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {CrudGenericService} from '@app/generics/crud-generic-service';
import {GlobalSettings} from '@models/global-settings';
import {UrlService} from '@services/url.service';
import {FactoryService} from '@services/factory.service';
import {CastResponse, CastResponseContainer} from '@decorators/cast-response';
import {Observable} from 'rxjs';
import {FileType} from '@models/file-type';
import {map, tap} from 'rxjs/operators';

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
  private _currentGlobalSetting!: GlobalSettings;

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

  setGlobalSettings(globalSettings: GlobalSettings): void {
    this._currentGlobalSetting = globalSettings;
  }

  getGlobalSettings(): GlobalSettings {
    return this._currentGlobalSetting;
  }

  @CastResponse(() => GlobalSettings, {
    unwrap: 'rs',
    fallback: '$default'
  })
  loadCurrentGlobalSettings(): Observable<GlobalSettings> {
    return this.load().pipe(
      map(settings => settings[0]),
      tap(settings => this.setGlobalSettings(settings))
    );
  }

  @CastResponse(() => FileType, {
    unwrap: 'rs',
    fallback: '$default'
  })
  loadAllFileTypes(): Observable<FileType[]> {
    return this.http.get<FileType[]>(this._getServiceURL() + '/file-types');
  }

  getAllowedFileTypes(): Observable<FileType[]> {
    return this.loadAllFileTypes()
      .pipe(
        map(list => list.filter(ele => this.getGlobalSettings().fileTypeParsed.includes(ele.id)))
      );
  }
}
