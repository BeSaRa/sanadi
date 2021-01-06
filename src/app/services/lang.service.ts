import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UrlService} from './url.service';
import {Observable} from 'rxjs';
import {Localization} from '../models/localization';
import {Generator} from '../decorators/generator';

@Injectable({
  providedIn: 'root'
})
export class LangService {

  constructor(private http: HttpClient, private urlService: UrlService) {
  }

  @Generator(Localization, true)
  loadLocalization(): Observable<Localization[]> {
    return this.http.get<Localization[]>(this.urlService.URLS.LANGUAGE);
  }

  addLocal(local: Localization): Observable<any> {
    return this.http.post(this.urlService.URLS.LANGUAGE, local);
  }

  updateLocal(local: Localization): Observable<any> {
    return this.http.put(this.urlService.URLS.LANGUAGE, local);
  }

  deleteLocal(local: Localization | number): Observable<any> {
    return this.http.delete(this.urlService.URLS.LANGUAGE);
  }
}
