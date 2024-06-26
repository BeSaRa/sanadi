import { INames } from '@contracts/i-names';
import { LangService } from '@services/lang.service';
import { FactoryService } from '@services/factory.service';
import { BaseModel } from './base-model';
import { TeamService } from '@services/team.service';
import { AdminResult } from './admin-result';
import { searchFunctionType } from '../types/types';
import { TeamInterceptor } from "@app/model-interceptors/team-interceptor";
import { InterceptModel } from "@decorators/intercept-model";
import { CommonStatusEnum } from '@app/enums/common-status.enum';

const interceptor = new TeamInterceptor();

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive
})
export class Team extends BaseModel<Team, TeamService> {
  authName!: string;
  autoClaim: boolean = false;
  isHidden: boolean = false;
  ldapGroupName!: string;
  parentDeptId!: number;
  createdOn!: string;
  createdBy!: number;
  status: number = CommonStatusEnum.ACTIVATED;
  email!:string;
  parentSectorId!:number;
  statusDateModified: string | null = '';
  isInternal!:boolean;

  createdByInfo!: AdminResult;
  updatedByInfo!: AdminResult;
  statusInfo!: AdminResult;
  sectorInfo!: AdminResult;
  createdOnString: string = '';
  updatedOnString: string = '';
  statusDateModifiedString: string = '';

  service: TeamService;
  langService!: LangService;

  searchFields: { [key: string]: searchFunctionType | string } = {
    arName: 'arName',
    enName: 'enName',
    authName: 'authName',
    createdBy: text => !this.createdByInfo ? false : this.createdByInfo.getName().toLowerCase().indexOf(text) !== -1,
    createdOn: 'createdOnString',
    updatedBy: text => !this.updatedByInfo ? false : this.updatedByInfo.getName().toLowerCase().indexOf(text) !== -1,
    updatedOn: 'updatedOnString',
    status: text => !this.statusInfo ? false : this.statusInfo.getName().toLowerCase().indexOf(text) !== -1
  };

  constructor() {
    super();
    this.service = FactoryService.getService('TeamService');
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }
}
