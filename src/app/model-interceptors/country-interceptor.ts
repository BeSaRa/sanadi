import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {Country} from '../models/country';
import {DateUtils} from '../helpers/date-utils';
import {isValidAdminResult} from '../helpers/utils';
import {AdminResult} from '../models/admin-result';

export class CountryInterceptor implements IModelInterceptor<Country> {
  send(model: Partial<Country>): Partial<Country> {
    delete model.service;
    delete model.langService;
    delete model.parentInfo;
    delete model.statusInfo;
    delete model.statusDateModifiedString;
    return model;
  }

  receive(model: Country): Country {
    model.statusDateModifiedString = DateUtils.getDateStringFromDate(model.statusDateModified, 'DEFAULT_DATE_FORMAT');
    model.parentInfo = isValidAdminResult(model.parentInfo) ? AdminResult.createInstance(model.parentInfo) : AdminResult.createInstance({});
    model.statusInfo = isValidAdminResult(model.statusInfo) ? AdminResult.createInstance(model.statusInfo) : AdminResult.createInstance({});
    return model;
  }
}
