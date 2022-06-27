import {Injectable} from '@angular/core';
import {Lookup} from '../models/lookup';
import {BackendGenericService} from '../generics/backend-generic-service';
import {HttpClient} from '@angular/common/http';
import {UrlService} from './url.service';
import {ILookupMap} from '@contracts/i-lookup-map';
import {FactoryService} from './factory.service';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {LangService} from './lang.service';
import {CommonUtils} from '@helpers/common-utils';

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

  /**
   * @description Find the lookup from lookupList by lookupKey
   * @param lookupList
   * @param lookupKey
   */
  findLookupByLookupKey(lookupList: Lookup[] = [], lookupKey?: number): Lookup | null {
    if (!CommonUtils.isValidValue(lookupKey) || !lookupList || lookupList.length === 0) {
      return null;
    }
    return lookupList.find(x => x.lookupKey === lookupKey) || null;
  }

  getLookupArrayAsObject(lookupCategory: keyof ILookupMap, keyProperty: string = 'lookupKey'): {[key: string]: Lookup } {
    if (!lookupCategory || !CommonUtils.isValidValue(keyProperty)) {
      return {};
    }
    return this.listByCategory[lookupCategory].reduce((acc, cur) => {
      // @ts-ignore
      acc[cur[keyProperty]] = cur;
      return acc;
    }, {});
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

  private static _getAllLookupCategoryKeys(lookupMap: any, sorted: boolean = false, asLookupInterface: boolean = false) {
    let keys = Object.keys(lookupMap);
    if (sorted) {
      keys = keys.sort((a: string, b: string) => {
        a = ('' + a).toLowerCase();
        b = ('' + b).toLowerCase();
        if (a > b) {
          return 1;
        }
        if (a < b) {
          return -1;
        }
        return 0;
      });
    }
    if (asLookupInterface) {
      console.log('{\n' + keys.join(': Lookup[];\n') + '\n}');
      return;
    }
    console.log('{\n' + keys.join(',\n') + '\n}');
  }

  private static _changeLookupArrayToEnum(lookupArray: Lookup[], showInUpperCase: boolean = true, printConsole: boolean = true): string {
    let value = [];
    for (let i = 0; i < lookupArray.length; i++) {
      let key = (lookupArray[i].enName || '').split(' ').join('_');
      if (showInUpperCase) {
        key = key.toUpperCase();
      }
      value.push(key.trim() + ' = ' + lookupArray[i].lookupKey);
    }
    if (printConsole) {
      console.log('{\n' + value.join(',\n') + '\n}');
    }
    return '{\n' + value.join(',\n') + '\n}';
  }

  private static _changeLookupMapToEnum(lookupMap: ILookupMap, showInUpperCase: boolean = true): void {
    for (let cat in lookupMap) {
      let lookupArray: Lookup[] = lookupMap[cat as keyof ILookupMap];
      let result = LookupService._changeLookupArrayToEnum(lookupArray, showInUpperCase, false);
      console.log(cat + '  =', result);
    }
  }
}
