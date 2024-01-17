import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { ISearchFieldsMap } from "@app/types/types";
import { SearchableCloneable } from "./searchable-cloneable";

export class GdxMoiPersonal extends SearchableCloneable<GdxMoiPersonal>{

  arbName1!: string;
  arbName2!: string;
  arbName3!: string;
  arbName4!: string;
  arbName5!: string;
  birthDateStr!: string;
  engName1!: string;
  engName2!: string;
  engName3!: string;
  engName4!: string;
  engName5!: string;
  idCardExpiryDate!: string;
  natCodeTextAR!: string;
  natCodeTextEN!: string;
  qidNum!: string;
  sex!: string;
  secretKey!: string;


  searchFields: ISearchFieldsMap<GdxMoiPersonal> = {
    ...normalSearchFields(['arbName1', 'arbName2', 'arbName3', 'arbName4', 'arbName5',
      'birthDateStr', 'engName1', 'engName2', 'engName3', 'engName4', 'engName5',
      'idCardExpiryDate', 'natCodeTextAR', 'natCodeTextEN', 'qidNum', 'sex', 'secretKey'])
  }
}