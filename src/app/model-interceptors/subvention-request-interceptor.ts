import { SubventionRequest } from '../models/subvention-request';
import { AdminResult } from '../models/admin-result';
import { DateUtils } from '@helpers/date-utils';

export class SubventionRequestInterceptor {
  receive(model: SubventionRequest): SubventionRequest {
    model.orgInfo = AdminResult.createInstance(model.orgInfo);
    model.orgUserInfo = AdminResult.createInstance(model.orgUserInfo);
    model.requestChannelInfo = AdminResult.createInstance(
      model.requestChannelInfo
    );
    model.requestStatusInfo = AdminResult.createInstance(
      model.requestStatusInfo
    );
    model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo);
    model.aidLookupParentInfo &&
      (model.aidLookupParentInfo = AdminResult.createInstance(
        model.aidLookupParentInfo
      ));
    model.aidLookupInfo &&
      (model.aidLookupInfo = AdminResult.createInstance(model.aidLookupInfo));
    model.creationDateString = DateUtils.getDateStringFromDate(
      model.creationDate
    );
    model.creationDate = DateUtils.changeDateToDatepicker(model.creationDate);
    model.statusDateModifiedString = DateUtils.getDateStringFromDate(
      model.statusDateModified
    );
    model.statusDateModified = DateUtils.changeDateToDatepicker(
      model.statusDateModified
    );
    return model;
  }

  send(model: any | SubventionRequest): any {
    model.creationDate = !model.creationDate
      ? model.creationDate
      : DateUtils.changeDateFromDatepicker(model.creationDate)?.toISOString();
    model.statusDateModified = !model.statusDateModified
      ? model.statusDateModified
      : DateUtils.changeDateFromDatepicker(
          model.statusDateModified
        )?.toISOString();
    model.allowDataSharing = model.allowDataSharing ?? false;
    if (!model.allowDataSharing) {
      model.allowCompletion = false;
    }
    SubventionRequestInterceptor._deleteBeforeSend(model);

    return model;
  }

  private static _deleteBeforeSend(
    model: Partial<SubventionRequest> | any
  ): void {
    delete model.service;
    delete model.subventionRequestAidService;
    delete model.orgInfo;
    delete model.orgUserInfo;
    delete model.requestChannelInfo;
    delete model.aidLookupParentInfo;
    delete model.aidLookupInfo;
    delete model.requestStatusInfo;
    delete model.requestTypeInfo;
    delete model.searchFields;
    delete model.creationDateString;
    delete model.statusDateModifiedString;
    delete model.configService;
  }
}
