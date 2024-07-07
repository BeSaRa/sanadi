import { InterceptModel } from "@decorators/intercept-model";
import { WorldCheckInterceptor } from '@app/model-interceptors/world-check-interceptor';
import { IMyDateModel } from '@nodro7/angular-mydatepicker';

const { send, receive } = new WorldCheckInterceptor();

@InterceptModel({ send, receive })
export class WorldCheckSearchResultItem {
  categories: string[] = [];
  category!: string;
  countryLinks: [] = [];
  creationDate!: string | IMyDateModel;
  entityCreationDate!: string | IMyDateModel;
  entityModificationDate!: string | IMyDateModel;
  events: [] = [];
  gender!: string;
  identityDocuments: [] = [];
  lastAlertDate!: string | IMyDateModel;
  matchScore!: number;
  matchStrength!: string;
  matchedTerm!: string;
  matchedTerms: [] = [];
  modificationDate!: string | IMyDateModel;
  pepStatus!: null;
  primaryName!: string;
  providerType!: string;
  referenceId!: string;
  resultId!: string;
  sources: string[] = [];
  submittedTerm!: string;
  constructor() {
  }
}
