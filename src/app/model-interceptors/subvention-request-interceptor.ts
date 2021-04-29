import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {SubventionRequest} from '../models/subvention-request';
import {DatePipe, formatDate} from '@angular/common';
import {AdminResult} from '../models/admin-result';
import {FactoryService} from '../services/factory.service';
import {ConfigurationService} from '../services/configuration.service';
import {changeDateFromDatepicker, changeDateToDatepicker, getDateStringFromDate} from '../helpers/utils';

export class SubventionRequestInterceptor {
  static receive(model: SubventionRequest): SubventionRequest {
    // model.creationDate = model.creationDate ? formatDate(new Date(model.creationDate), 'yyyy-MM-dd', 'en-US') : '';
    // model.statusDateModified = model.statusDateModified ? formatDate(new Date(model.statusDateModified), 'yyyy-MM-dd', 'en-US') : '';

    model.orgBranchInfo = AdminResult.createInstance(model.orgBranchInfo);
    model.orgInfo = AdminResult.createInstance(model.orgInfo);
    model.orgUserInfo = AdminResult.createInstance(model.orgUserInfo);
    model.requestChannelInfo = AdminResult.createInstance(model.requestChannelInfo);
    model.requestStatusInfo = AdminResult.createInstance(model.requestStatusInfo);
    model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo);

    const config = FactoryService.getService<ConfigurationService>('ConfigurationService');
    // model.creationDateString = new DatePipe('en-US').transform(model.creationDate, config.CONFIG.DEFAULT_DATE_FORMAT) as string;

    model.creationDateString = getDateStringFromDate(model.creationDate);
    model.creationDate = changeDateToDatepicker(model.creationDate);
    model.statusDateModifiedString = getDateStringFromDate(model.statusDateModified);
    model.statusDateModified = changeDateToDatepicker(model.statusDateModified);
    return model;
  }

  static send(model: any | SubventionRequest): any {
    delete model.service;
    delete model.subventionRequestAidService;
    delete model.orgBranchInfo;
    delete model.orgInfo;
    delete model.orgUserInfo;
    delete model.requestChannelInfo;
    delete model.requestStatusInfo;
    delete model.requestTypeInfo;
    delete model.searchFields;
    delete model.creationDateString;
    delete model.statusDateModifiedString;
    delete model.configService;
    // model.creationDate = (new Date(model.creationDate)).toISOString();

    model.creationDate = !model.creationDate ? model.creationDate : changeDateFromDatepicker(model.creationDate)?.toISOString();
    model.statusDateModified = !model.statusDateModified ? model.statusDateModified : changeDateFromDatepicker(model.statusDateModified)?.toISOString();

    return model;
  }
}
