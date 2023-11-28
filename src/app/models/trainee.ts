import { BaseModel } from '@app/models/base-model';
import { FactoryService } from '@app/services/factory.service';
import { LangService } from '@app/services/lang.service';
import { TraineeService } from '@app/services/trainee.service';
import { INames } from '@app/interfaces/i-names';
import { Lookup } from '@app/models/lookup';
import { ISearchFieldsMap, searchFunctionType } from '@app/types/types';
import { InterceptModel } from "@decorators/intercept-model";
import { TraineeInterceptor } from "@app/model-interceptors/trainee-interceptor";
import { infoSearchFields } from '@helpers/info-search-fields';
import { Followup } from './followup';
import { AdminResult } from './admin-result';

const { receive, send } = new TraineeInterceptor()

@InterceptModel({
  receive, send
})
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
  externalOrgId!: number;
  addedByRACA!: boolean;
  isDraft!: boolean;

  statusInfo!: Lookup;
  nationalityInfo!: Lookup;
  externalOrgInfo!: AdminResult;
  
  searchFields: ISearchFieldsMap<Trainee>  = {
    arName: 'arName',
    enName: 'enName',
    phoneNumber: 'phoneNumber',
    department: 'department',
    employementPosition: 'employementPosition',
    ...infoSearchFields(['statusInfo', 'nationalityInfo', 'externalOrgInfo']),
  };

  constructor() {
    super();
    this.service = FactoryService.getService('TraineeService');
    this.lang = FactoryService.getService('LangService');
  }

  deleteTrainee(trainingProgramId: number) {
    return this.service.deleteTrainee(trainingProgramId, this.id);
  }

  getName(): string {
    return this[(this.lang.map.lang + 'Name') as keyof INames];
  }

  accept(trainingProgramId: number) {
    return this.service.accept(trainingProgramId, this.id);
  }

  reject(trainingProgramId: number, comment: string) {
    return this.service.reject(trainingProgramId, this.id, comment);
  }
}
