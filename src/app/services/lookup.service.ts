import {Injectable} from '@angular/core';
import {Lookup} from '../models/lookup';
import {Observable} from 'rxjs';
import {LookupCategories} from '../enums/lookup-categories';
import {BackendGenericService} from '../generics/backend-generic-service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UrlService} from './url.service';
import {Generator} from '../decorators/generator';

@Injectable({
  providedIn: 'root'
})
export class LookupService extends BackendGenericService<Lookup> {
  list!: Lookup[];

  constructor(public http: HttpClient, private urlService: UrlService) {
    super();
  }

  _getModel(): any {
    return Lookup;
  }

  _getSendInterceptor(): any {
  }

  _getServiceURL(): string {
    return this.urlService.URLS.LOOKUPS;
  }

  @Generator(undefined, true)
  loadByCategory(category: any | LookupCategories): Observable<Lookup[]> {
    return this.http.get<Lookup[]>(this.urlService.URLS.LOOKUPS, {
      params: new HttpParams({fromObject: {category}})
    });
  }
}
