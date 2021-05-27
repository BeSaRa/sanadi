import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {Team} from '../models/team';

export class TeamInterceptor implements IModelInterceptor<Team> {
  receive(model: Team): Team {
    return model;
  }

  send(model: any): any {
    return model;
  }
}
