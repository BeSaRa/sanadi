import { INames } from '@contracts/i-names';
import { LangService } from '@app/services/lang.service';
import { FactoryService } from '@app/services/factory.service';
import { AdminResult } from "./admin-result";

export class Agency {
  arName!: string;
  enName!: string;
  id!: number;
  fnId!: string;
  parent!: number;
  receiverNameInfo!: AdminResult;
  langService: LangService;

  constructor() {
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }
}
