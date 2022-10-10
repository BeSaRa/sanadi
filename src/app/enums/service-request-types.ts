import {AllRequestTypesEnum} from '@app/enums/all-request-types-enum';

export enum ServiceRequestTypes {
  NEW = 1,
  RENEW = 2,
  EXTEND = 3,
  UPDATE = 4,
  CANCEL = 5
}

export enum CollectionRequestType {
  NEW = 1,
  UPDATE = 4,
  CANCEL = 5
}

export enum UrgentInterventionAnnouncementRequestType {
  ANNOUNCEMENT = AllRequestTypesEnum.ANNOUNCEMENT,
  START = AllRequestTypesEnum.START,
  EDIT = AllRequestTypesEnum.EDIT
}

export enum CustomsExemptionRequestTypes {
  NEW = 1,
  CANCEL = 5
}
