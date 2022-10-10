import {AllRequestTypesEnum} from '@app/enums/all-request-types-enum';

export enum NPORequestType {
  NEW = AllRequestTypesEnum.NEW,
  UPDATE = AllRequestTypesEnum.UPDATE,
  CANCEL = AllRequestTypesEnum.CANCEL,
  DISBANDMENT = AllRequestTypesEnum.DISBANDMENT,
  CLEARANCE = AllRequestTypesEnum.CLEARANCE
}
