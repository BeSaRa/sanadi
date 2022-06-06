import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {Donor} from '@app/models/donor';
import {DateUtils} from '@helpers/date-utils';
import {FactoryService} from '@services/factory.service';
import {LookupService} from '@services/lookup.service';
import {AdminResult} from '@app/models/admin-result';

export class DonorInterceptor implements IModelInterceptor<Donor> {
  receive(model: Donor): Donor {
    model.statusDateModifiedString = DateUtils.getDateStringFromDate(model.statusDateModified, 'DEFAULT_DATE_FORMAT');
    let lookupService: LookupService = FactoryService.getService('LookupService'),
      statusInfo = lookupService.listByCategory.CommonStatus.find(x => x.lookupKey === model.status);
    model.statusInfo = statusInfo ? statusInfo.convertToAdminResult() : new AdminResult();
    return model;
  }

  send(model: Partial<Donor>): Partial<Donor> {
    DonorInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<Donor> | any): void {
    delete model.service;
    delete model.searchFields;
    delete model.statusInfo;
    delete model.statusDateModifiedString;
  }

}
