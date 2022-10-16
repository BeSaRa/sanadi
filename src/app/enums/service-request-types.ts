import {AllRequestTypesEnum} from '@app/enums/all-request-types-enum';

export enum ServiceRequestTypes {
  NEW = AllRequestTypesEnum.NEW,
  RENEW = AllRequestTypesEnum.RENEW,
  EXTEND = AllRequestTypesEnum.EXTEND,
  UPDATE = AllRequestTypesEnum.UPDATE,
  CANCEL = AllRequestTypesEnum.CANCEL
}

export enum CollectionRequestType {
  NEW = AllRequestTypesEnum.NEW,
  UPDATE = AllRequestTypesEnum.UPDATE,
  CANCEL = AllRequestTypesEnum.CANCEL
}

export enum UrgentInterventionAnnouncementRequestType {
  ANNOUNCEMENT = AllRequestTypesEnum.ANNOUNCEMENT,
  START = AllRequestTypesEnum.START,
  EDIT = AllRequestTypesEnum.EDIT
}

export enum CustomsExemptionRequestTypes {
  NEW = AllRequestTypesEnum.NEW,
  CANCEL = AllRequestTypesEnum.CANCEL
}
