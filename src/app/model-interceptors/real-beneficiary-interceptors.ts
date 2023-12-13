import { IModelInterceptor } from '@contracts/i-model-interceptor';
import { RealBeneficiary } from '@app/models/real-beneficiary';
import { DateUtils } from '@app/helpers/date-utils';
import { AdminResult } from '@app/models/admin-result';
import { isValidAdminResult } from '@app/helpers/utils';

export class RealBeneficiaryInterceptor implements IModelInterceptor<RealBeneficiary> {
  receive(model: RealBeneficiary): RealBeneficiary {
    model.birthDateString = model.birthDate ? DateUtils.getDateStringFromDate(model.birthDate, 'DEFAULT_DATE_FORMAT') : '';
    model.birthDate = DateUtils.getDateStringFromDate(model.birthDate);
    model.startDate = DateUtils.getDateStringFromDate(model.startDate);
    model.idDate = DateUtils.getDateStringFromDate(model.idDate);
    model.idExpiryDate = DateUtils.getDateStringFromDate(model.idExpiryDate);
    model.passportDate = DateUtils.getDateStringFromDate(model.passportDate);
    model.passportExpiryDate = DateUtils.getDateStringFromDate(model.passportExpiryDate);
    model.lastUpdateDate = DateUtils.getDateStringFromDate(model.lastUpdateDate);
    model.birthDateStamp = !model.birthDate ? null : DateUtils.getTimeStampFromDate(model.birthDate);
    model.idDateStamp = !model.idDate ? null : DateUtils.getTimeStampFromDate(model.idDate);
    model.passportDateStamp = !model.passportDate ? null : DateUtils.getTimeStampFromDate(model.passportDate);
    model.idExpiryDateStamp = !model.idExpiryDate ? null : DateUtils.getTimeStampFromDate(model.idExpiryDate);
    model.startDateStamp = !model.startDate ? null : DateUtils.getTimeStampFromDate(model.startDate);
    model.lastUpdateDateStamp = !model.lastUpdateDate ? null : DateUtils.getTimeStampFromDate(model.lastUpdateDate);
    model.passportExpiryDateStamp = !model.passportExpiryDate ? null : DateUtils.getTimeStampFromDate(model.passportExpiryDate);
    model.nationalityInfo = isValidAdminResult(model.nationalityInfo) ? AdminResult.createInstance(model.nationalityInfo) : AdminResult.createInstance({});

    return model;
  }

  send(model: Partial<RealBeneficiary>): Partial<RealBeneficiary> {
    delete model.searchFields;
    delete model.birthDateString;
    delete model.auditOperation;
    delete model.birthDateStamp
    delete model.idDateStamp
    delete model.passportDateStamp
    delete model.idExpiryDateStamp
    delete model.startDateStamp
    delete model.lastUpdateDateStamp
    delete model.passportExpiryDateStamp
    delete model.nationalityInfo
    return model;
  }
}
