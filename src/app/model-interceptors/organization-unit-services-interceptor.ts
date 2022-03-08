import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {OrgUnitService} from '@app/models/org-unit-service';
import {AdminResult} from '@app/models/admin-result';
import {DateUtils} from '@app/helpers/date-utils';

export class OrganizationUnitServicesInterceptor implements IModelInterceptor<OrgUnitService> {
  receive(model: OrgUnitService): OrgUnitService {
    model.orgUnitInfo = AdminResult.createInstance(model.orgUnitInfo);
    model.serviceDataInfo = AdminResult.createInstance(model.serviceDataInfo);
    model.statusDateModifiedString = model.statusDateModified ? DateUtils.getDateStringFromDate(model.statusDateModified, 'DEFAULT_DATE_FORMAT') : '';
    return model;
  }

  send(model: Partial<OrgUnitService>): Partial<OrgUnitService> {
    OrganizationUnitServicesInterceptor._deleteBeforeSend(model);
    return model;
  }
  private static _deleteBeforeSend(model: Partial<OrgUnitService> | any): void {
    // always delete arName, enName because they are default from BaseModel and not needed in this model
    delete model.arName;
    delete model.enName;

    delete model.service;
    delete model.langService;
    delete model.lookupService;
    delete model.searchFields;
    delete model.statusDateModifiedString;

    delete model.orgUnitInfo;
    delete model.serviceDataInfo;
  }
}
