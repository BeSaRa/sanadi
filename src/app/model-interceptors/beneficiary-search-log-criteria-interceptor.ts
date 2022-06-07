import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {IBeneficiarySearchLogCriteria} from '@contracts/i-beneficiary-search-log-criteria';
import {BeneficiarySearchLog} from '@app/models/beneficiary-search-log';
import {DateUtils} from '@helpers/date-utils';
import {AdminResult} from '@app/models/admin-result';
import {ConfigurationService} from '@services/configuration.service';
import {FactoryService} from '@services/factory.service';

export class BeneficiarySearchLogCriteriaInterceptor implements IModelInterceptor<BeneficiarySearchLog> {
  receive(model: BeneficiarySearchLog): BeneficiarySearchLog {
    model.actionTimeString = DateUtils.getDateStringFromDate(model.actionTime, 'DEFAULT_DATE_FORMAT');
    model.orgInfo && (model.orgInfo = AdminResult.createInstance(model.orgInfo));
    model.orgBranchInfo && (model.orgBranchInfo = AdminResult.createInstance(model.orgBranchInfo));
    model.orgUserInfo && (model.orgUserInfo = AdminResult.createInstance(model.orgUserInfo));
    model.benIdTypeInfo && (model.benIdTypeInfo = AdminResult.createInstance(model.benIdTypeInfo));
    model.benNationalityInfo && (model.benNationalityInfo = AdminResult.createInstance(model.benNationalityInfo));
    return model;
  }

  send(model: Partial<IBeneficiarySearchLogCriteria>): Partial<IBeneficiarySearchLogCriteria> {
    const configurationService: ConfigurationService = FactoryService.getService('ConfigurationService');
    model.fromActionTime && (model.fromActionTime = DateUtils.setStartOfDay(model.fromActionTime).format(configurationService.CONFIG.TIMESTAMP).split(' ').join('T') + 'Z');
    model.toActionTime && (model.toActionTime = DateUtils.setEndOfDay(model.toActionTime).format(configurationService.CONFIG.TIMESTAMP).split(' ').join('T') + 'Z');
    BeneficiarySearchLogCriteriaInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<IBeneficiarySearchLogCriteria> | any): void {
    delete model.actionTimeString;
    delete model.orgBranchInfo;
    delete model.orgInfo;
    delete model.orgUserInfo;
    delete model.benIdTypeInfo;
    delete model.benNationalityInfo;
  }
}
