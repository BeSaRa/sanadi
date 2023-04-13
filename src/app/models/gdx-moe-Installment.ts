import { ISearchFieldsMap } from "@app/types/types";
import { SearchableCloneable } from "./searchable-cloneable";
import { normalSearchFields } from "@app/helpers/normal-search-fields";

export class GdxMoeInstallment extends SearchableCloneable<GdxMoeInstallment>{
    feeHeadTypeEN!:String;
    feeHeadTypeAR!:String;
    schoolYear!:String;
    amount!:number;

    
    searchFields: ISearchFieldsMap<GdxMoeInstallment> = {
        ...normalSearchFields(['feeHeadTypeAR','feeHeadTypeEN','schoolYear','amount'])
    }
}
  