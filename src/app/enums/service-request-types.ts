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
  UPDATE = AllRequestTypesEnum.UPDATE
}

export enum CustomsExemptionRequestTypes {
  NEW = AllRequestTypesEnum.NEW,
  CANCEL = AllRequestTypesEnum.CANCEL
}

export enum UrgentInterventionFinancialRequestType {
  TRANSFER = AllRequestTypesEnum.TRANSFER,
  RECEIVE = AllRequestTypesEnum.RECEIVE
}

export enum TransferringIndividualFundsAbroadRequestTypeEnum {
  NEW = AllRequestTypesEnum.NEW,
  UPDATE = AllRequestTypesEnum.UPDATE,
  CANCEL = AllRequestTypesEnum.CANCEL,
  TRANSFER_STATEMENT_TRANSFERRED = AllRequestTypesEnum.TRANSFER_STATEMENT_TRANSFERRED,
  TRANSFER_STATEMENT_TRANSFER_NOT_COMPLETED = AllRequestTypesEnum.TRANSFER_STATEMENT_TRANSFER_NOT_COMPLETED
}

export enum ProjectModelRequestType {
  NEW = AllRequestTypesEnum.NEW,
  UPDATE = AllRequestTypesEnum.UPDATE
}

export enum NPORequestType {
  NEW = AllRequestTypesEnum.NEW,
  UPDATE = AllRequestTypesEnum.UPDATE,
  CANCEL = AllRequestTypesEnum.CANCEL,
  DISBANDMENT = AllRequestTypesEnum.DISBANDMENT,
  CLEARANCE = AllRequestTypesEnum.CLEARANCE
}

export enum EmploymentRequestType {
  NEW = AllRequestTypesEnum.NEW,
  UPDATE = AllRequestTypesEnum.UPDATE,
  CANCEL = AllRequestTypesEnum.CANCEL
}

export enum BankAccountRequestTypes {
  NEW = AllRequestTypesEnum.NEW,
  UPDATE = AllRequestTypesEnum.UPDATE,
  CANCEL = AllRequestTypesEnum.CANCEL
}

export enum AffiliationRequestType {
  NEW = AllRequestTypesEnum.NEW,
  UPDATE = AllRequestTypesEnum.UPDATE,
  CANCEL = AllRequestTypesEnum.CANCEL
}

export enum FinancialTransferRequestTypes {
  NEW = AllRequestTypesEnum.NEW,
  UPDATE = AllRequestTypesEnum.UPDATE,
  CANCEL = AllRequestTypesEnum.CANCEL,
  TRANSFER_STATEMENT_TRANSFERRED = AllRequestTypesEnum.TRANSFER_STATEMENT_TRANSFERRED
}

export enum GeneralAssociationMeetingRequestTypeEnum {
  NEW = AllRequestTypesEnum.NEW,
  UPDATE = AllRequestTypesEnum.UPDATE,
  CANCEL = AllRequestTypesEnum.CANCEL,
}
