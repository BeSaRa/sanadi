import { IModelInterceptor } from '@contracts/i-model-interceptor';
import { RealBeneficiary } from '@app/models/real-beneficiary';
import { DateUtils } from '@app/helpers/date-utils';

export class RealBeneficiaryInterceptor implements IModelInterceptor<RealBeneficiary> {
  receive(model: RealBeneficiary): RealBeneficiary {
    model.birthDateString = model.birthDate ? DateUtils.getDateStringFromDate(model.birthDate, 'DEFAULT_DATE_FORMAT') : '';
    console.log(model.birthDateString);

    model.birthDate = DateUtils.getDateStringFromDate(model.birthDate);
    model.startDate = DateUtils.getDateStringFromDate(model.startDate);
    model.iddate = DateUtils.getDateStringFromDate(model.iddate);
    model.iDDate = DateUtils.getDateStringFromDate(model.iDDate);
    model.idexpiryDate = DateUtils.getDateStringFromDate(model.idexpiryDate);
    model.iDExpiryDate = DateUtils.getDateStringFromDate(model.iDExpiryDate);
    model.passportDate = DateUtils.getDateStringFromDate(model.passportDate);
    model.lastUpdateDate = DateUtils.getDateStringFromDate(model.lastUpdateDate);
    model.birthDateStamp = !model.birthDate ? null : DateUtils.getTimeStampFromDate(model.birthDate);
    model.iDDateStamp = !model.iDDate ? null : DateUtils.getTimeStampFromDate(model.iDDate);
    model.idexpiryDateStamp = !model.idexpiryDate ? null : DateUtils.getTimeStampFromDate(model.idexpiryDate);
    model.passportDateStamp = !model.passportDate ? null : DateUtils.getTimeStampFromDate(model.passportDate);
    model.iDExpiryDateStamp = !model.iDExpiryDate ? null : DateUtils.getTimeStampFromDate(model.iDExpiryDate);
    model.startDateStamp = !model.startDate ? null : DateUtils.getTimeStampFromDate(model.startDate);
    model.lastUpdateDateStamp = !model.lastUpdateDate ? null : DateUtils.getTimeStampFromDate(model.lastUpdateDate);
    model.passportExpiryDateStamp = !model.passportExpiryDate ? null : DateUtils.getTimeStampFromDate(model.passportExpiryDate);

    return model;
  }

  send(model: Partial<RealBeneficiary>): Partial<RealBeneficiary> {
    delete model.searchFields;
    delete model.birthDateString;
    delete model.auditOperation;
    delete model.birthDateStamp
    delete model.iDDateStamp
    delete model.idexpiryDateStamp
    delete model.passportDateStamp
    delete model.iDExpiryDateStamp
    delete model.startDateStamp
    delete model.lastUpdateDateStamp
    delete model.passportExpiryDateStamp
    return model;
  }
}
