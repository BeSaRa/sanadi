import { ISearchFieldsMap } from "@app/types/types";
import { SearchableCloneable } from "./searchable-cloneable";
import { normalSearchFields } from "@app/helpers/normal-search-fields";

export class GdxMoePrivateSchoolPendingPayment extends SearchableCloneable<GdxMoePrivateSchoolPendingPayment>{
    schoolNameEN!:String;
    schoolNameAR!:String;
    schoolYear!:String;

    searchFields: ISearchFieldsMap<GdxMoePrivateSchoolPendingPayment> = {
        ...normalSearchFields(['schoolNameEN','schoolNameAR','schoolYear'])
    }
}