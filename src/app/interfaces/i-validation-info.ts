import {IKeyValue} from './i-key-value';

export interface IValidationInfo {
  fieldName: string | null;
  errorName: string | null;
  errorValue: IKeyValue | null;
  message: { key: string, replaceValues: any };
}
