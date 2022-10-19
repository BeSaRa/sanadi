import { INames } from '@contracts/i-names';
import { LangService } from '@app/services/lang.service';
import { FactoryService } from '@app/services/factory.service';

export class generalProcess {
  langService: LangService;
  id!: number;
  arName!: string;
  enName!: string;

  clientData!: string;

  mainClass!: number;
  subClass!: number;

  departmentId!: number;
  teamId!: string;
  subTeamId!: number;

  active!: true;

  template!: string;

  constructor() {
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  buildForm(control: boolean = false) {
    const {

    } = this;
    return {

    }
  }
}
