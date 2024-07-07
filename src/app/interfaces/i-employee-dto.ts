import {AdminResult} from '@models/admin-result';
import {IMyDateModel} from '@nodro7/angular-mydatepicker';

export interface IEmployeeDto {
  id: number | null;
  arabicName: string;
  englishName: string;
  jobTitle: string;
  identificationType: number;
  identificationNumber: string;
  passportNumber: string;
  gender: number;
  nationality: number;
  // phone: string;
  // department: string;
  // contractLocation: number;
  contractLocationType: number;
  officeId: string;
  charityId: number;
  // contractType: number;
  // jobContractType: number;
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
  contractStatusInfo: AdminResult;
  contractLocationInfo: AdminResult;
  // contractTypeInfo: AdminResult;
  genderInfo: AdminResult;
  identificationTypeInfo: AdminResult;
  // jobContractTypeInfo: AdminResult;
  nationalityInfo: AdminResult;
  orgUnitInfo: AdminResult;
  statusInfo: AdminResult;
  countryInfo: AdminResult;
  contractLocationTypeInfo: AdminResult;
  functionalGroupInfo: AdminResult;
  officeInfo: AdminResult;
  qInfo: AdminResult;
}
