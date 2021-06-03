import {Beneficiary} from '../models/beneficiary';
import {AdminResult} from '../models/admin-result';
import {isValidValue} from '../helpers/utils';
import {changeDateFromDatepicker, changeDateToDatepicker, getDateStringFromDate} from '../helpers/utils-date';

export class BeneficiaryInterceptor {
  static receive(model: Beneficiary): Beneficiary {
    model.OccuptionStatusInfo = AdminResult.createInstance(model.OccuptionStatusInfo);
    model.addressStatusInfo = AdminResult.createInstance(model.addressStatusInfo);
    model.benPrimaryIdNationalityInfo = AdminResult.createInstance(model.benPrimaryIdNationalityInfo);
    model.benPrimaryIdTypeInfo = AdminResult.createInstance(model.benPrimaryIdTypeInfo);
    model.benSecIdNationalityInfo = AdminResult.createInstance(model.benSecIdNationalityInfo);
    model.benSecIdTypeInfo = AdminResult.createInstance(model.benSecIdTypeInfo);
    model.educationLevelInfo = AdminResult.createInstance(model.educationLevelInfo);
    model.genderInfo = AdminResult.createInstance(model.genderInfo);
    model.govEmploymentStatusInfo = AdminResult.createInstance(model.govEmploymentStatusInfo);
    model.maritalStatusInfo = AdminResult.createInstance(model.maritalStatusInfo);
    model.occuptionStatusInfo = AdminResult.createInstance(model.occuptionStatusInfo);
    model.orgBranchInfo = AdminResult.createInstance(model.orgBranchInfo);
    model.orgInfo = AdminResult.createInstance(model.orgInfo);
    model.orgUserInfo = AdminResult.createInstance(model.orgUserInfo);
    model.residenceCountryInfo = AdminResult.createInstance(model.residenceCountryInfo);
    model.residenceStatusInfo = AdminResult.createInstance(model.residenceStatusInfo);
    model.benNationalityInfo = AdminResult.createInstance(model.benNationalityInfo);

    //model.dateOfBirth = formatDate(new Date(model.dateOfBirth), 'yyyy-MM-dd', 'en-US');
    model.dateOfBirthString = getDateStringFromDate(model.dateOfBirth);
    model.dateOfBirth = changeDateToDatepicker(model.dateOfBirth);

    return model;
  }

  static send(model: any): any {
    delete model.langService;
    delete model.service;
    delete model.OccuptionStatusInfo;
    delete model.addressStatusInfo;
    delete model.benPrimaryIdNationalityInfo;
    delete model.benPrimaryIdTypeInfo;
    delete model.benSecIdNationalityInfo;
    delete model.benSecIdTypeInfo;
    delete model.educationLevelInfo;
    delete model.genderInfo;
    delete model.govEmploymentStatusInfo;
    delete model.maritalStatusInfo;
    delete model.occuptionStatusInfo;
    delete model.orgBranchInfo;
    delete model.orgInfo;
    delete model.orgUserInfo;
    delete model.residenceCountryInfo;
    delete model.residenceStatusInfo;
    delete model.benNationalityInfo;
    delete model.dateOfBirthString;
    // model.dateOfBirth = (new Date(model.dateOfBirth)).toISOString();
    model.dateOfBirth = !model.dateOfBirth ? model.dateOfBirth : changeDateFromDatepicker(model.dateOfBirth)?.toISOString();

    //if no secondary id type is selected, clear secondary id and nationality fields
    if (!isValidValue(model.benSecIdType)) {
      model.benSecIdNationality = null;
      model.benSecIdNumber = null;
    }

    // trim the arName, enName, primary id number, secondary id number
    model.arName = !!model.arName ? ('' + model.arName).trim() : model.arName;
    model.enName = !!model.enName ? ('' + model.enName).trim() : model.enName;
    model.benPrimaryIdNumber = !!model.benPrimaryIdNumber ? ('' + model.benPrimaryIdNumber).trim() : model.benPrimaryIdNumber;
    model.benSecIdNumber = !!model.benSecIdNumber ? ('' + model.benSecIdNumber).trim() : model.benSecIdNumber;

    return model;
  }
}
