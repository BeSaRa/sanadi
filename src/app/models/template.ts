import {AdminResult} from "@app/models/admin-result";
import {SearchableCloneable} from "@app/models/searchable-cloneable";
import {normalSearchFields} from "@helpers/normal-search-fields";
import {infoSearchFields} from "@helpers/info-search-fields";

export class Template extends SearchableCloneable<Template> {
  templateId!: string;
  projectName!: string
  templateFullSerial!: string
  publicStatus!: number
  templateCost!: number
  templateStatus!: number
  templateStatusInfo!: AdminResult
  publicStatusInfo!: AdminResult

  searchFields = {
    ...normalSearchFields(['projectName', 'templateFullSerial','templateCost']),
    ...infoSearchFields(['templateStatusInfo', 'publicStatusInfo'])
  }
}
