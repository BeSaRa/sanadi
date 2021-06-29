import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {Country} from '../models/country';

export class CountryInterceptor implements IModelInterceptor<Country> {
  send(model: Partial<Country>): Partial<Country> {
    return model;
  }

  receive(model: Country): Country {
    return model;
  }
}
