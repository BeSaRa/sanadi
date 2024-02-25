import { Cloneable } from '@app/models/cloneable';
import { INames } from '@app/interfaces/i-names';
import { FactoryService } from '@app/services/factory.service';
import { LangService } from '@services/lang.service';
export class ExternalProjectLicensing extends Cloneable<ExternalProjectLicensing>{
  id!:string;
  fullSerial!:string;
  arName!:string;
  enName!:string;
  organizationId!:number;
  private langService: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }
  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }
}
