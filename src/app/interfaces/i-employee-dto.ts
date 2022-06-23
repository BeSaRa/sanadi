import { IMyDateModel } from 'angular-mydatepicker';
export interface IEmployeeDto {
  id: number;
  arabicName: string;
  englishName: string;
  jobTitle: number;
  identificationType: number;
  identificationNumber: string;
  passportNumber: string;
  gender: number;
  nationality: number;
  phone: string;
  department: string;
  contractLocation: string;
  contractLocationType: number;
  officeName: string;
  contractType: number;
  jobContractType: number;
  contractStatus: number;
  contractExpiryDate: string | IMyDateModel;
  workStartDate: string | IMyDateModel;
  workEndDate: string | IMyDateModel;
  updatedOn: string | IMyDateModel;
  qId: string;
  updatedBy: number;
}
