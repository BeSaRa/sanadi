import { IMyDateModel } from 'angular-mydatepicker';
import {IValueOperator} from './i-value-operator';

export interface IBeneficiaryCriteria {
  limit: number;
  arName: Partial<IValueOperator>;
  enName: Partial<IValueOperator>;
  benNationality: number;
  benPrimaryIdType: number;
  benPrimaryIdNumber: string;
  benPrimaryIdNationality: number;
  benSecIdType: number;
  benSecIdNationality: number;
  benSecIdNumber: string;
  phoneNumber1: string;
  occuptionStatus: number
  expiryDate: string;
}


