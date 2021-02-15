import {Injectable} from '@angular/core';
import {Lookup} from '../models/lookup';
import {Observable} from 'rxjs';
import {LookupCategories} from '../enums/lookup-categories';
import {BackendGenericService} from '../generics/backend-generic-service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UrlService} from './url.service';
import {Generator} from '../decorators/generator';
import {ILookupMap} from '../interfaces/i-lookup-map';
import {isValidValue} from '../helpers/utils';
import {FactoryService} from './factory.service';
import {ILanguageKeys} from '../interfaces/i-language-keys';
import {LangService} from './lang.service';

@Injectable({
  providedIn: 'root'
})
export class LookupService extends BackendGenericService<Lookup> {
  list!: Lookup[];
  listByCategory!: ILookupMap;

  constructor(public http: HttpClient, private urlService: UrlService, private langService: LangService) {
    super();
    FactoryService.registerService('LookupService', this);
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

  /**
   * @description Get the lookup list by category  name
   * @param categoryName: LookupCategories|string
   */
  getByCategory(categoryName: LookupCategories | string): Lookup[] {
    return this.listByCategory[categoryName as keyof ILookupMap];
  }

  /**
   * @description Get the lookup list by category id
   * @param categoryId: number|string
   */
  getByCategoryId(categoryId: number | string): Lookup[] {
    let category = null;
    for (const lookup in LookupCategories) {
      if (LookupCategories.hasOwnProperty(lookup) && LookupCategories[lookup as keyof typeof LookupCategories] === categoryId) {
        const categoryName = lookup.substr(0, lookup.indexOf('_CAT_ID'));
        category = LookupCategories[categoryName as keyof typeof LookupCategories];
      }
    }
    if (!category) {
      return [];
    }
    return this.getByCategory(category);
  }

  /**
   * @description Get the lookup by lookupKey and category name
   * @param lookupKey: number
   * @param categoryName: LookupCategories|string
   */
  getByLookupKeyAndCategory(lookupKey: number, categoryName: LookupCategories | string): Lookup | null {
    if (!isValidValue(lookupKey) || !isValidValue(categoryName)) {
      return null;
    }
    const lookups = this.getByCategory(categoryName);
    if (!lookups || lookups.length === 0) {
      return null;
    }
    return lookups.find(x => x.lookupKey === lookupKey) || null;
  }


  /**
   * @description Get the lookup by lookupKey and category id
   * @param lookupKey: number
   * @param categoryId: number|string
   */
  getByLookupKeyAndCategoryId(lookupKey: number, categoryId: string | number): Lookup | null {
    if (!isValidValue(lookupKey) || !isValidValue(categoryId)) {
      return null;
    }
    const lookups = this.getByCategoryId(categoryId);
    if (!lookups || lookups.length === 0) {
      return null;
    }
    return lookups.find(x => x.lookupKey === lookupKey) || null;
  }

  getLookupByCategoryAndId(category: keyof ILookupMap, value: any) {
    return this.listByCategory[category][value];
  }

  _getReceiveInterceptor(): any {
  }

  getStringOperators(): Lookup[] {
    return ['equal', 'contains', 'start_with', 'end_with'].map((item, index) => {
      return (new Lookup().setValues(
        this.langService.getArabicLocalByKey(<keyof ILanguageKeys> item),
        this.langService.getEnglishLocalByKey(<keyof ILanguageKeys> item),
        index,
        index + 1
      ));
    });
  }
}
