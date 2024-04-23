import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {Team} from '../models/team';
import {AdminResult} from '../models/admin-result';
import {isValidAdminResult, isValidValue} from '../helpers/utils';
import {DateUtils} from '../helpers/date-utils';

export class TeamInterceptor implements IModelInterceptor<Team> {
  receive(model: Team): Team {
    model.createdOnString = DateUtils.getDateStringFromDate(model.createdOn, 'DEFAULT_DATE_FORMAT');
    model.updatedOnString = DateUtils.getDateStringFromDate(model.updatedOn, 'DEFAULT_DATE_FORMAT');
    model.statusDateModifiedString = DateUtils.getDateStringFromDate(model.statusDateModified, 'DEFAULT_DATE_FORMAT');
    model.statusInfo = isValidAdminResult(model.statusInfo) ? AdminResult.createInstance(model.statusInfo) : AdminResult.createInstance({});
    model.createdByInfo = isValidAdminResult(model.createdByInfo) ? AdminResult.createInstance(model.createdByInfo) : AdminResult.createInstance({});
    model.updatedByInfo = isValidAdminResult(model.updatedByInfo) ? AdminResult.createInstance(model.updatedByInfo) : AdminResult.createInstance({});
    model.sectorInfo = isValidAdminResult(model.sectorInfo) ? AdminResult.createInstance(model.sectorInfo) : AdminResult.createInstance({});

    model.autoClaim = isValidValue(model.autoClaim) ? model.autoClaim : false;
    model.isHidden = isValidValue(model.isHidden) ? model.isHidden : false;
    return model;
  }

  send(model: any): any {
    model.autoClaim = isValidValue(model.autoClaim) ? model.autoClaim : false;
    model.isHidden = isValidValue(model.isHidden) ? model.isHidden : false;

    delete model.service;
    delete model.langService;
    delete model.createdOnString;
    delete model.updatedOnString;
    delete model.statusDateModifiedString;
    delete model.createdByInfo;
    delete model.statusInfo;
    delete model.updatedByInfo;
    delete model.sectorInfo;

    return model;
  }
}
