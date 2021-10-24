import {BaseModel} from "@app/models/base-model";
import {SDGoalService} from "@app/services/sdgoal.service";
import {FactoryService} from "@app/services/factory.service";

export class SDGoal extends BaseModel<SDGoal, SDGoalService> {
  service!: SDGoalService;

  constructor() {
    super();
    this.service = FactoryService.getService('SDGoalService');
  }
}
