import {Injectable} from '@angular/core';
import {Lookup} from '../models/lookup';
import {Observable, of} from 'rxjs';
import {LookupCategories} from '../enums/lookup-categories';
import {BackendGenericService} from '../generics/backend-generic-service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UrlService} from './url.service';
import {Generator} from '../decorators/generator';
import {ILookupMap} from "../interfaces/i-lookup-map";

@Injectable({
  providedIn: 'root'
})
export class LookupService extends BackendGenericService<Lookup> {
  list!: Lookup[];
  listByCategory!: ILookupMap;

  constructor(public http: HttpClient, private urlService: UrlService) {
    super();
  }

  setLookupsMap(lookupMap: ILookupMap): ILookupMap {
    return this.listByCategory = lookupMap;
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

  getByCategory(category: any | LookupCategories): Lookup[] {
    return this.listByCategory[category as keyof ILookupMap];
  }

  getByCategoryId(categoryId: any | LookupCategories): Lookup[] {
    let category = null;
    for (const lookup in LookupCategories) {
      if (LookupCategories.hasOwnProperty(lookup) && LookupCategories[lookup] === categoryId) {
        category = lookup.substr(0, lookup.indexOf('_CAT_ID'));
      }
    }
    if (!category) {
      return [];
    }
    return this.listByCategory[LookupCategories[category] as keyof ILookupMap];
  }
}
