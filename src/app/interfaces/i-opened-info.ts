import {INavigatedItem} from "@app/interfaces/inavigated-item";
import {CaseModel} from "@app/models/case-model";

export interface IOpenedInfo extends INavigatedItem {
  model: CaseModel<any, any>;
}
