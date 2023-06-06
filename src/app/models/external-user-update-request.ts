import {BaseModel} from '@app/models/base-model';
import {UserSecurityConfiguration} from '@app/models/user-security-configuration';
import {FactoryService} from '@services/factory.service';
import {ExternalUserUpdateRequestInterceptor} from '@app/model-interceptors/external-user-update-request-interceptor';
import {InterceptModel} from '@decorators/intercept-model';
import {ExternalUserUpdateRequestService} from '@services/external-user-update-request.service';
import {INames} from '@contracts/i-names';
import {LangService} from '@services/lang.service';
import {Observable} from 'rxjs';
import {ExternalUserUpdateRequestTypeEnum} from '@app/enums/external-user-update-request-type.enum';
import {AdminResult} from '@app/models/admin-result';
import {ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@helpers/normal-search-fields';
import {infoSearchFields} from '@helpers/info-search-fields';
import {ExternalUser} from '@app/models/external-user';
import {ExternalUserUpdateRequestStatusEnum} from '@app/enums/external-user-update-request-status.enum';

const {send, receive} = new ExternalUserUpdateRequestInterceptor();

@InterceptModel({send, receive})
export class ExternalUserUpdateRequest extends BaseModel<ExternalUserUpdateRequest, ExternalUserUpdateRequestService> {
  externalUserID!: number;
  generalUserId!: number;
  customRoleId!: number;
  qid!: string;
  profileId!: number;
  status!: number;
  nationality!: number;
  gender!: number;
  serviceToken!: string;
  domainName!: string;
  empNum!: string;
  phoneNumber!: string;
  officialPhoneNumber!: string;
  phoneExtension!: string;
  email!: string;
  jobTitle!: number;
  jobTitleName!: string;
  requestType!: ExternalUserUpdateRequestTypeEnum;
  requestStatus!: ExternalUserUpdateRequestStatusEnum;
  newPermissionList: number[] = [];
  oldPermissionList: number[] = [];
  notes!: string;
  oldServicePermissions: UserSecurityConfiguration[] = [];
  newServicePermissions: UserSecurityConfiguration[] = [];
  newMenuList: number[] = [];
  oldMenuList: number[] = [];

  // extra properties
  updatedOnString!: string;
  requestStatusInfo!: AdminResult;
  profileInfo!: AdminResult;
  requestTypeInfo!: AdminResult;
  customRoleInfo!: AdminResult;
  jobTitleInfo!: AdminResult;
  nationalityInfo!: AdminResult;
  statusInfo!: AdminResult;
  userTypeInfo!: AdminResult;
  service!: ExternalUserUpdateRequestService;
  langService!: LangService;
  updateByInfo!: AdminResult;
  requestSaveType: 'SAVE_REQUEST' | 'SAVE_USER' | undefined = undefined;

  searchFields: ISearchFieldsMap<ExternalUserUpdateRequest> = {
    ...normalSearchFields(['domainName', 'arName', 'enName', 'updatedOnString']),
    ...infoSearchFields(['requestStatusInfo', 'requestTypeInfo', 'updateByInfo'])
  };

  constructor() {
    super();
    this.service = FactoryService.getService('ExternalUserUpdateRequestService');
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  save(): Observable<ExternalUserUpdateRequest> {
    return this.id ? this.update() : this.create();
  }

  isNewUserRequest(): boolean {
    return this.requestType === ExternalUserUpdateRequestTypeEnum.NEW;
  }

  getBasicControlValues(): any {
    const {
      arName,
      enName,
      qid,
      empNum,
      phoneNumber,
      phoneExtension,
      officialPhoneNumber,
      email,
      jobTitleName,
      status,
      profileId,
      customRoleId
    } = this;
    return {
      arName,
      enName,
      qid,
      empNum,
      phoneNumber,
      phoneExtension,
      officialPhoneNumber,
      email,
      jobTitleName,
      status,
      profileId,
      customRoleId
    };
  }

  convertToExternalUser(): ExternalUser {
    let externalUser = new ExternalUser().clone();
    let controlKeys = externalUser.getBasicControlKeys();
    controlKeys.forEach(key => {
      // @ts-ignore
      externalUser[key as unknown as keyof ExternalUser] = this[key as unknown as keyof ExternalUserUpdateRequest];
    });
    externalUser.id = this.externalUserID;
    externalUser.generalUserId = this.generalUserId;
    externalUser.domainName = this.domainName;
    return externalUser;
  }

  isApproved(): boolean {
    return this.requestStatus === ExternalUserUpdateRequestStatusEnum.APPROVED;
  }

  isRejected(): boolean {
    return this.requestStatus === ExternalUserUpdateRequestStatusEnum.REJECTED;
  }

  isInProgress(): boolean {
    return this.requestStatus === ExternalUserUpdateRequestStatusEnum.IN_PROGRESS;
  }
}
