import { DateUtils } from '@app/helpers/date-utils';
import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {AdminResult} from '@app/models/admin-result';
import {NpoEmployee} from '@app/models/npo-employee';

export class NpoEmployeeInterceptor implements IModelInterceptor<NpoEmployee>{
  receive(model: NpoEmployee): NpoEmployee {

    model.nationalityInfo = AdminResult.createInstance(model.nationalityInfo);
    model.contractLocationInfo = AdminResult.createInstance(model.contractLocationInfo);
    model.statusInfo = AdminResult.createInstance(model.statusInfo);
    model.identificationTypeInfo = AdminResult.createInstance(model.identificationTypeInfo);
    model.genderInfo = AdminResult.createInstance(model.genderInfo);
    model.contractLocationTypeInfo = AdminResult.createInstance(model.contractLocationTypeInfo);
    model.contractStatusInfo = AdminResult.createInstance(model.contractStatusInfo);
    model.contractTypeInfo = AdminResult.createInstance(model.contractTypeInfo);
    model.functionalGroupInfo = AdminResult.createInstance(model.functionalGroupInfo);
    model.officeInfo = AdminResult.createInstance(model.officeInfo);
    model.orgUnitInfo = AdminResult.createInstance(model.orgUnitInfo);
    model.qInfo = AdminResult.createInstance(model.qInfo);
    model.jobContractTypeInfo = AdminResult.createInstance(model.jobContractTypeInfo);
    model.countryInfo = AdminResult.createInstance(model.countryInfo);

    model.expIdPass = DateUtils.changeDateToDatepicker(model.expIdPass);
    model.workStartDate = DateUtils.changeDateToDatepicker(model.workStartDate);
    model.workEndDate = DateUtils.changeDateToDatepicker(model.workEndDate);
    model.contractExpiryDate = DateUtils.changeDateToDatepicker(model.contractExpiryDate);

    return model;
  }

  send(model: Partial<NpoEmployee>): Partial<NpoEmployee> {
    model.expIdPass = DateUtils.getDateStringFromDate(model.expIdPass);
    model.workStartDate = DateUtils.getDateStringFromDate(model.workStartDate);
    model.workEndDate = DateUtils.getDateStringFromDate(model.workEndDate);
    model.contractExpiryDate = DateUtils.getDateStringFromDate(model.contractExpiryDate);

    delete model.langService;
    delete model.statusInfo;
    delete model.contractLocationInfo;
    delete model.nationalityInfo;
    delete model.identificationTypeInfo;
    delete model.genderInfo;
    delete model.functionalGroupInfo;
    delete model.contractLocationTypeInfo;
    delete model.contractStatusInfo;
    delete model.contractTypeInfo;
    delete model.officeInfo
    delete model.orgUnitInfo
    delete model.qInfo
    delete model.jobContractTypeInfo
    delete model.countryInfo
    return model;
  }
}
