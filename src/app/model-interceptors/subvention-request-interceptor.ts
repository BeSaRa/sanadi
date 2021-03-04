import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {SubventionRequest} from '../models/subvention-request';
import {DatePipe, formatDate} from '@angular/common';
import {AdminResult} from '../models/admin-result';
import {FactoryService} from '../services/factory.service';
import {ConfigurationService} from '../services/configuration.service';

export class SubventionRequestInterceptor implements IModelInterceptor<SubventionRequest> {
  receive(model: SubventionRequest): SubventionRequest {
    model.creationDate = model.creationDate ? formatDate(new Date(model.creationDate), 'yyyy-MM-dd', 'en-US') : '';
    model.statusDateModified = model.statusDateModified ? formatDate(new Date(model.statusDateModified), 'yyyy-MM-dd', 'en-US') : '';

    model.orgBranchInfo = AdminResult.createInstance(model.orgBranchInfo);
    model.orgInfo = AdminResult.createInstance(model.orgInfo);
    model.orgUserInfo = AdminResult.createInstance(model.orgUserInfo);
    model.requestChannelInfo = AdminResult.createInstance(model.requestChannelInfo);
    model.requestStatusInfo = AdminResult.createInstance(model.requestStatusInfo);
    model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo);

    const config = FactoryService.getService<ConfigurationService>('ConfigurationService');
    model.creationDateString = new DatePipe('en-US').transform(model.creationDate, config.CONFIG.DEFAULT_DATE_FORMAT) as string;

    return model;
  }

  send(model: any | SubventionRequest): any {
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
    delete model.configService;
    model.creationDate = (new Date(model.creationDate)).toISOString();
    return model;
  }
}
