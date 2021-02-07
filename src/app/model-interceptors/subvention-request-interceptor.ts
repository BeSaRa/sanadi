import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {SubventionRequest} from '../models/subvention-request';
import {formatDate} from '@angular/common';

export class SubventionRequestInterceptor implements IModelInterceptor<SubventionRequest> {
  receive(model: SubventionRequest): SubventionRequest {
    model.creationDate = model.creationDate ? formatDate(new Date(model.creationDate), 'yyyy-MM-dd', 'en-US') : '';
    model.statusDateModified = model.statusDateModified ? formatDate(new Date(model.statusDateModified), 'yyyy-MM-dd', 'en-US') : '';
    return model;
  }

  send(model: any | SubventionRequest): any {
    delete model.service;
    delete model.subventionRequestAidService;
    model.creationDate = (new Date(model.creationDate)).toISOString();
    return model;
  }
}
