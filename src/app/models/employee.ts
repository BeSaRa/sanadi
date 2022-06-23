import { Cloneable } from "@app/models/cloneable";
import { IMyDateModel } from "angular-mydatepicker";
import { IEmployeeDto } from "./../interfaces/i-employee-dto";
export class Employee extends Cloneable<Employee> implements IEmployeeDto {
  id!: number;
  arabicName!: string;
  englishName!: string;
  jobTitle!: number;
  identificationType!: number;
  identificationNumber!: string;
  passportNumber!: string;
  gender!: number;
  nationality!: number;
  phone!: string;
  department!: string;
  contractLocation!: string;
  contractLocationType!: number;
  officeName!: string;
  contractType!: number;
  jobContractType!: number;
  contractStatus!: number;
  qId!: string;
  updatedBy!: number;
  contractExpiryDate!: string | IMyDateModel;
  workStartDate!: string | IMyDateModel;
  workEndDate!: string | IMyDateModel;
  updatedOn!: string | IMyDateModel;
  constructor() {
    super();
  }
}
