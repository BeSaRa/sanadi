import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {CaseAudit} from '@models/case-audit';
import {DateUtils} from '@helpers/date-utils';
import {CaseModel} from '@models/case-model';
import {CaseTypes} from '@enums/case-types.enum';
import {FactoryService} from '@services/factory.service';
import {CaseAuditService} from '@services/case-audit.service';
import {GeneralInterceptor} from '@model-interceptors/general-interceptor';

export class CaseAuditInterceptor implements IModelInterceptor<CaseAudit> {
  receive(model: CaseAudit): CaseAudit {
    model.auditDateString = DateUtils.getDateStringFromDate(model.auditDate, 'TIMESTAMP') || '';
    CaseAuditInterceptor._parseCaseObject(model);

    const caseType: CaseTypes = model.caseObjectParsed.caseType;
    const service: CaseAuditService = FactoryService.getService('CaseAuditService');
    const caseModel = service.caseModels[caseType] ? new service.caseModels[caseType]() : null;
    const caseInterceptor = service.caseInterceptors[caseType] ? new service.caseInterceptors[caseType]() : null;
    if (!caseModel) {
      console.error('Model is missing! Please add model to caseModels in CaseAuditService');
      return model;
    }
    model.caseObjectParsed = GeneralInterceptor.receive(caseModel.clone(model.caseObjectParsed));
    if (!caseInterceptor) {
      console.error('Interceptor is missing! Please add interceptor to caseInterceptors in CaseAuditService');
      return model;
    }
    model.caseObjectParsed = caseInterceptor.receive(model.caseObjectParsed);
    return model;
  }

  send(model: Partial<CaseAudit>): Partial<CaseAudit> {
    CaseAuditInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _parseCaseObject(model: CaseAudit) {
    try {
      model.caseObjectParsed = JSON.parse(model.caseObject);
    } catch (_) {
      model.caseObjectParsed = {} as CaseModel<any, any>;
    }
  }

  private static _deleteBeforeSend(model: Partial<CaseAudit>): void {
    delete model.auditDateString;
    delete model.caseObjectParsed;
  }
}
