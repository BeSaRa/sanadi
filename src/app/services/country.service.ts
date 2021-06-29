import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BackendGenericService} from '../generics/backend-generic-service';
import {Country} from '../models/country';
import {FactoryService} from './factory.service';
import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {CountryInterceptor} from '../model-interceptors/country-interceptor';
import {UrlService} from './url.service';

@Injectable({
  providedIn: 'root'
})
export class CountryService extends BackendGenericService<Country> {
  list: Country[] = [];
  interceptor: IModelInterceptor<Country> = new CountryInterceptor();

  _getModel() {
    return Country;
  }

  _getSendInterceptor() {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.COUNTRY;
  }

  _getReceiveInterceptor() {
    return this.interceptor.receive;
  }

  constructor(public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('CountryService', this);
  }
}
