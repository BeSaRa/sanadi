import {BaseModel} from "@app/models/base-model";
import {SDGoalService} from "@app/services/sdgoal.service";
import {FactoryService} from "@app/services/factory.service";
import {INames} from "@app/interfaces/i-names";
import {LangService} from "@app/services/lang.service";

export class SDGoal extends BaseModel<SDGoal, SDGoalService> {
  service!: SDGoalService;
  langService!: LangService

  constructor() {
    super();
    this.service = FactoryService.getService('SDGoalService');
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }
}
