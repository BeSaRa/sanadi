export interface IEmployeeDto {
  id: 0;
  arName: string;
  enName: string;
  jobTitle: string;
  identificationType: number;
  identificationNumber: string;
  gender: number;
  nationality: number;
  phone: string;
  department: string;
  contractLocationType: number;
  officeName: string;
  contractType: number;
  contractStatus: number;
  contractExpiryDate: Date;
  workStartDate: Date;
  workEndDate: Date;
  jobTitleInfo: ISelectDto;
  identificationTypeInfo: ISelectDto;
  genderInfo: ISelectDto;
  nationalityInfo: ISelectDto;
  contractTypeInfo: ISelectDto;
  contractStatusInfo: ISelectDto;
  contractLocationTypeInfo: ISelectDto;
}

interface ISelectDto {
  arName: string;
  enName: string;
  id: number;
  fnId: string;
  parent: number;
}
