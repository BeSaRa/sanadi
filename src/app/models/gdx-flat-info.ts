import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@helpers/normal-search-fields';

export class GdxFlatInfo extends SearchableCloneable<GdxFlatInfo>{
  systemNum!: number;
  qId!: string;
  ownerName!: string;
  sandNum!: number;
  transactionNo!: number;
  transactionYear!: number;
  ownerShares!: number;
  transactionType!: string;
  contractDate!: string;

  searchFields: ISearchFieldsMap<GdxFlatInfo> = {
    ...normalSearchFields(['transactionNo', 'transactionType', 'ownerName', 'contractDate', 'ownerShares'])
  }
}
