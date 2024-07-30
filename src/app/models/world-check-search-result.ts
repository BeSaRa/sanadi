import { InterceptModel } from "@decorators/intercept-model";
import { IMyDateModel } from '@nodro7/angular-mydatepicker';
import { WorldCheckSearchResultItem } from "./world-check-search-result-item";
import { WorldCheckSearchResultInterceptor } from "@app/model-interceptors/world-check-search-result-interceptor";
import { BannedPerson } from "./banned-person";
import { BannedPersonTerrorism } from "./BannedPersonTerrorism";

const { send, receive } = new WorldCheckSearchResultInterceptor();

@InterceptModel({ send, receive })
export class WorldCheckSearchResult {
  id!: number;
  caseId!: string;
  creationDate!: string | IMyDateModel;
  entityType!: string;
  name!: string;
  results: WorldCheckSearchResultItem[] = [];

  exactMatches!: number;
  mediumMatches!: number;
  strongMatches!: number;
  weakMatches!: number;

  constructor() {
  }
}

