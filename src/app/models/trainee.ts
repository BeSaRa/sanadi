import {BaseModel} from '@app/models/base-model';
import {FactoryService} from '@app/services/factory.service';
import {LangService} from '@app/services/lang.service';
import {TraineeService} from '@app/services/trainee.service';
import {INames} from '@app/interfaces/i-names';

export class Trainee extends BaseModel<Trainee, TraineeService>{
  generalUserId!: number;
  jobType!: number;
  department!: string;
  trainingRecord!: string;
  currentJob!: string;
  employementPosition!: string;
  email!: string;
  phoneNumber!: string;
  gender!: number;
  nationality!: number;
  service: TraineeService;
  lang: LangService;
  status!: number;

  constructor() {
    super();
    this.service = FactoryService.getService('TraineeService');
    this.lang = FactoryService.getService('LangService');
  }

  getName(): string {
    return this[(this.lang.map.lang + 'Name') as keyof INames];
  }
}
