import { IdentificationType } from '@app/enums/identification-type.enum';
import { AdminResult } from './../models/admin-result';
import { IMyDateModel } from "angular-mydatepicker";
import { DateUtils } from "./../helpers/date-utils";
import { Employee } from "./../models/employee";
import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";

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

    if (model.identificationType == IdentificationType.Identification) {
      delete model.passportNumber
    } else {
      delete model.identificationNumber
    }

    delete model.contractStatusInfo
    delete model.contractTypeInfo
    delete model.genderInfo
    delete model.identificationTypeInfo
    delete model.jobContractTypeInfo
    delete model.nationalityInfo
    delete model.orgUnitInfo
    delete model.statusInfo
    delete model.countryInfo
    delete model.contractLocationTypeInfo
    delete model.qId
    delete model.qInfo
    delete model.contractExpiryDateStamp
    delete model.workStartDateStamp
    delete model.workEndDateStamp
    delete model.updatedOnStamp
    delete model.expIdPassStamp
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
    return model;
  }
}
