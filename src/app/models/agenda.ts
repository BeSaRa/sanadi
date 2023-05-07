import { ISearchFieldsMap } from "@app/types/types";
import { SearchableCloneable } from "./searchable-cloneable";
import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { CustomValidators } from "@app/validators/custom-validators";


export class Agenda extends SearchableCloneable<Agenda> {
  description!: string;

  searchFields: ISearchFieldsMap<Agenda> = {
    ...normalSearchFields(['description']),
  };
  constructor() {
    super();
  }

  getAgendaFields(control: boolean = false): any {
    const {
      description
    } = this;
    return {
        description: control? [description, [CustomValidators.required, CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX)]]:description
    }
  }   
}
