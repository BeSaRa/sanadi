import {INavigatedItem} from "@app/interfaces/inavigated-item";
import {CaseModel} from "@app/models/case-model";
import {ChecklistItem} from "@app/models/checklist-item";

export interface IOpenedInfo extends INavigatedItem {
  model: CaseModel<any, any>;
  checklist: ChecklistItem[]
}
