import { JobTitle } from './../models/job-title';
import { AdminResult } from './../models/admin-result';
import { IMyDateModel } from 'angular-mydatepicker';
export interface IEmployeeDto {
  id: number | null;
  arabicName: string;
  englishName: string;
  jobTitleId: number;
  identificationType: number;
  identificationNumber: string;
  passportNumber: string;
  gender: number;
  nationality: number;
  phone: string;
  department: string;
  contractLocation: string;
  contractLocationType: number;
  officeId: number;
  contractType: number;
  jobContractType: number;
  contractStatus: number;
  contractExpiryDate: string | IMyDateModel;
  workStartDate: string | IMyDateModel;
  workEndDate: string | IMyDateModel;
  updatedOn: string | IMyDateModel;
  expIdPass: string | IMyDateModel;
  jobNumber: string;
  functionalGroup: number;
  qId: string;
  updatedBy: number;
  jobTitleInfo: AdminResult | JobTitle | undefined;
  contractStatusInfo: AdminResult;
  contractTypeInfo: AdminResult;
  genderInfo: AdminResult;
  identificationTypeInfo: AdminResult;
  jobContractTypeInfo: AdminResult;
  nationalityInfo: AdminResult;
  orgUnitInfo: AdminResult;
  statusInfo: AdminResult;
  countryInfo: AdminResult;
  contractLocationTypeInfo: AdminResult;
  qInfo: AdminResult;
}
