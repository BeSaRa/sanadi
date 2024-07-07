import { IdentificationType } from '@app/enums/identification-type.enum';
import { AdminResult } from './../models/admin-result';
import { IMyDateModel } from '@nodro7/angular-mydatepicker';
import { DateUtils } from "./../helpers/date-utils";
import { Employee } from "./../models/employee";
import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { ContractLocationTypes } from '@app/enums/contract-location-types.enum';

export class EmployeeInterceptor implements IModelInterceptor<Employee> {
  send(model: Partial<Employee>): Partial<Employee> {
    model.contractExpiryDate = !model.contractExpiryDate
      ? undefined
      : DateUtils.changeDateFromDatepicker(
        model.contractExpiryDate as unknown as IMyDateModel
      )?.toISOString();
    model.workStartDate = !model.workStartDate
      ? undefined
      : DateUtils.changeDateFromDatepicker(
        model.workStartDate as unknown as IMyDateModel
      )?.toISOString();
    model.workEndDate = !model.workEndDate
      ? undefined
      : DateUtils.changeDateFromDatepicker(
        model.workEndDate as unknown as IMyDateModel
      )?.toISOString();
    model.expIdPass = !model.expIdPass
      ? undefined
      : DateUtils.changeDateFromDatepicker(
        model.expIdPass as unknown as IMyDateModel
      )?.toISOString();

    if (model.contractLocationType == ContractLocationTypes.External) {
      delete model.charityId
    } else {
      delete model.officeId
    }

    if (model.identificationType == IdentificationType.Identification) {
      delete model.passportNumber
    } else {
      delete model.identificationNumber
    }

    delete model.contractStatusInfo
    // delete model.contractTypeInfo
    delete model.genderInfo
    delete model.identificationTypeInfo
    // delete model.jobContractTypeInfo
    delete model.nationalityInfo
    delete model.orgUnitInfo
    delete model.statusInfo
    delete model.countryInfo
    delete model.contractLocationInfo
    delete model.contractLocationTypeInfo
    delete model.qId
    delete model.qInfo
    delete model.contractExpiryDateStamp
    delete model.workStartDateStamp
    delete model.workEndDateStamp
    delete model.updatedOnStamp
    delete model.expIdPassStamp
    delete model.functionalGroupInfo
    delete model.officeInfo

    return model;
  }
  receive(model: Employee): Employee {
    model.workStartDate = DateUtils.changeDateToDatepicker(model.workStartDate);
    model.workEndDate = DateUtils.changeDateToDatepicker(model.workEndDate);
    model.updatedOn = DateUtils.changeDateToDatepicker(model.updatedOn);
    model.expIdPass = DateUtils.changeDateToDatepicker(model.expIdPass);
    model.contractExpiryDateStamp = !model.contractExpiryDate ? null : DateUtils.getTimeStampFromDate(model.contractExpiryDate)
    model.workStartDateStamp = !model.workStartDate ? null : DateUtils.getTimeStampFromDate(model.workStartDate)
    model.workEndDateStamp = !model.workEndDate ? null : DateUtils.getTimeStampFromDate(model.workEndDate)
    model.updatedOnStamp = !model.updatedOn ? null : DateUtils.getTimeStampFromDate(model.updatedOn)
    model.expIdPassStamp = !model.expIdPass ? null : DateUtils.getTimeStampFromDate(model.expIdPass)
    model.contractExpiryDate = DateUtils.changeDateToDatepicker(
      model.contractExpiryDate
    );
    model.genderInfo = AdminResult.createInstance(model.genderInfo ?? {});
    model.contractStatusInfo = AdminResult.createInstance(model.contractStatusInfo  ?? {});
    // model.contractTypeInfo = AdminResult.createInstance(model.contractTypeInfo  ?? {});
    model.identificationTypeInfo = AdminResult.createInstance(model.identificationTypeInfo  ?? {});
    // model.jobContractTypeInfo = AdminResult.createInstance(model.jobContractTypeInfo  ?? {});
    model.nationalityInfo = AdminResult.createInstance(model.nationalityInfo  ?? {});
    model.orgUnitInfo = AdminResult.createInstance(model.orgUnitInfo  ?? {});
    model.statusInfo = AdminResult.createInstance(model.statusInfo  ?? {});
    model.countryInfo = AdminResult.createInstance(model.countryInfo  ?? {});
    model.contractLocationInfo = AdminResult.createInstance(model.contractLocationInfo  ?? {});
    model.contractLocationTypeInfo = AdminResult.createInstance(model.contractLocationTypeInfo  ?? {});
    model.functionalGroupInfo = AdminResult.createInstance(model.functionalGroupInfo  ?? {});
    model.officeInfo = AdminResult.createInstance(model.officeInfo  ?? {});
    model.qInfo = AdminResult.createInstance(model.qInfo  ?? {});
    return model;
  }
}
