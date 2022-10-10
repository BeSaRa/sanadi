import {AllRequestTypesEnum} from '@app/enums/all-request-types-enum';

export enum TransferringIndividualFundsAbroadRequestTypeEnum {
  NEW = AllRequestTypesEnum.NEW,
  UPDATE = AllRequestTypesEnum.UPDATE,
  CANCEL = AllRequestTypesEnum.CANCEL,
  TRANSFER_STATEMENT_TRANSFERRED = AllRequestTypesEnum.TRANSFER_STATEMENT_TRANSFERRED,
  TRANSFER_STATEMENT_TRANSFER_NOT_COMPLETED = AllRequestTypesEnum.TRANSFER_STATEMENT_TRANSFER_NOT_COMPLETED
}
