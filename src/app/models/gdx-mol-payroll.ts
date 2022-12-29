import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@helpers/normal-search-fields';

export class GdxMolPayroll extends SearchableCloneable<GdxMolPayroll> {
  payrollMonth!: number;
  payrollYear!: number;
  visaNumber!: string;
  establishmentName!: string;
  establishmentNameAra!: string;
  qId!: string;
  netSalary!: number;
  basicSalary!: number;

  searchFields: ISearchFieldsMap<GdxMolPayroll> = {
    ...normalSearchFields(['qId', 'payrollMonth', 'payrollYear', 'visaNumber', 'establishmentName', 'establishmentNameAra', 'netSalary', 'basicSalary'])
  }
}
