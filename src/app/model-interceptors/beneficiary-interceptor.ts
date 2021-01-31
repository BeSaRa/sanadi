import {Beneficiary} from '../models/beneficiary';
import {AdminResult} from '../models/admin-result';

function send(model: any): any {
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
  return model;
}

function receive(model: Beneficiary): any {
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
  return model;
}

export {
  send,
  receive
};
