import { WorldCheckSearchResult } from '@app/models/world-check-search-result';
import { IModelInterceptor } from '@contracts/i-model-interceptor';

export class WorldCheckSearchResultInterceptor implements IModelInterceptor<WorldCheckSearchResult> {
  send(model: Partial<WorldCheckSearchResult>): Partial<WorldCheckSearchResult> {
    return model;
  }

  receive(model: WorldCheckSearchResult): WorldCheckSearchResult {
    return model;
  }

}
