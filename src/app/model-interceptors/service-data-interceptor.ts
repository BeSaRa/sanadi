import {ServiceData} from '../models/service-data';
import {isValidAdminResult} from '../helpers/utils';
import {AdminResult} from '../models/admin-result';
import {DateUtils} from '../helpers/date-utils';

export class ServiceDataInterceptor {
  static receive(model: ServiceData): ServiceData {
    model.statusInfo = isValidAdminResult(model.statusInfo) ? AdminResult.createInstance(model.statusInfo) : model.statusInfo;
    model.statusDateModifiedString = DateUtils.getDateStringFromDate(model.statusDateModified, 'DEFAULT_DATE_FORMAT');

    model.updatedOnString = DateUtils.getDateStringFromDate(model.updatedOn, 'DEFAULT_DATE_FORMAT');
    model.updatedByInfo = AdminResult.createInstance(model.updatedByInfo);

    return model;
  }

  static send(model: Partial<ServiceData>): Partial<ServiceData> {
    model.caseType = Number(model.caseType);

    delete model.service;
    delete model.langService;
    delete model.lookupService;
    delete model.searchFields;
    delete model.statusInfo;
    delete model.statusDateModifiedString;
    delete model.updatedByInfo;

    return model;
  }

}
