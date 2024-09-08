import { SubventionRequestAid } from '@models/subvention-request-aid';
import { AdminResult } from '@models/admin-result';
import { DateUtils } from '@helpers/date-utils';
import { ConfigurationService } from '@app/services/configuration.service';
import { FactoryService } from '@app/services/factory.service';

export class SubventionRequestAidInterceptor {
  receive(model: SubventionRequestAid): SubventionRequestAid {
    model.orgUserInfo = AdminResult.createInstance(model.orgUserInfo);
    model.orgInfo = AdminResult.createInstance(model.orgInfo);
    model.statusInfo = AdminResult.createInstance(model.statusInfo);
    model.aidLookupParentInfo = AdminResult.createInstance(model.aidLookupParentInfo);
    model.aids = model.aids.map((aid) => {
      aid.aidLookupInfo = AdminResult.createInstance(aid.aidLookupInfo);
      model.aidCount += 1;
      return aid;
    });

    model.creationDateString = model.creationDate ? DateUtils.getDateStringFromDate(model.creationDate, 'DEFAULT_DATE_FORMAT') : '';
    model.statusDateModifiedString = model.statusDateModified ? DateUtils.getDateStringFromDate(model.statusDateModified, 'DEFAULT_DATE_FORMAT') : '';

    return model;
  }

  send(model: SubventionRequestAid | any): (SubventionRequestAid | any) {
    const configurationService: ConfigurationService = FactoryService.getService('ConfigurationService');
    model.creationDateFrom && (model.creationDateFrom = DateUtils.setStartOfDay(model.creationDateFrom).format(configurationService.CONFIG.TIMESTAMP).split(' ').join('T') + 'Z');
    model.creationDateTo && (model.creationDateTo = DateUtils.setEndOfDay(model.creationDateTo).format(configurationService.CONFIG.TIMESTAMP).split(' ').join('T') + 'Z');
    model.statusDateModifiedFrom && (model.statusDateModifiedFrom = DateUtils.setStartOfDay(model.statusDateModifiedFrom).format(configurationService.CONFIG.TIMESTAMP).split(' ').join('T') + 'Z');
    model.statusDateModifiedTo && (model.statusDateModifiedTo = DateUtils.setEndOfDay(model.statusDateModifiedTo).format(configurationService.CONFIG.TIMESTAMP).split(' ').join('T') + 'Z');
    SubventionRequestAidInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<SubventionRequestAid> | any): void {
    delete model.subventionRequestService;
    delete model.creationDateString;
    delete model.aidCount;
    delete model.statusDateModifiedString;
    delete model.searchFields;
    delete model.searchFieldsInquiry;
    delete model.searchFieldsSearch;
  }
}
