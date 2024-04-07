import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { ISearchFieldsMap } from "@app/types/types";

export class VerificationTemplate {
  id!:number;
  verification!:string;

  searchFields: ISearchFieldsMap<VerificationTemplate> = {
    ...normalSearchFields(['verification']),
  };

}
