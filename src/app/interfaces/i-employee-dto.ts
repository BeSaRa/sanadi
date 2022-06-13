import { IMyDateModel } from 'angular-mydatepicker';
export interface IEmployeeDto {
  id: number;
  arName: string;
  enName: string;
  jobTitle: string;
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
}
