import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { ISearchFieldsMap } from "@app/types/types";
import { SearchableCloneable } from "./searchable-cloneable";

export class GdxMoiAddress extends SearchableCloneable<GdxMoiAddress>{
  addressDesc!: string;
  buildingNum!: string;
  email!: string;
  mobileNum!: string;
  postBoxNum!: string;
  qidNum!: string;
  streetNameAr!: string;
  streetNameEn!: string;
  streetNum!: string;
  telephoneNum!: string;
  unitNum!: string;
  zoneNum!: string;
  secretKey!: string;

  searchFields: ISearchFieldsMap<GdxMoiAddress> = {
    ...normalSearchFields(['addressDesc', 'buildingNum', 'email',
     'mobileNum', 'postBoxNum', 'qidNum', 'streetNameAr', 'streetNameEn',
     'streetNum','telephoneNum','unitNum','zoneNum','secretKey'])
  }
}