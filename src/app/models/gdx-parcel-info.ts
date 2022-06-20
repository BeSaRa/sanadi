import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@helpers/normal-search-fields';

export class GdxParcelInfo extends SearchableCloneable<GdxParcelInfo> {
  ownerName!: string;
  parcelNo!: number;
  sharesCount!: number;
  zone!: string;
  city!: string;
  district!: string;
  areaNo!: number;
  contractType!: string;
  parcelType!: string;

  searchFields: ISearchFieldsMap<GdxParcelInfo> = {
   ...normalSearchFields(['parcelNo', 'parcelType', 'ownerName', 'city', 'zone', 'sharesCount'])
  }
}
