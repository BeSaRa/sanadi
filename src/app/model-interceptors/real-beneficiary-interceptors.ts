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

    return model;
  }

  send(model: Partial<RealBeneficiary>): Partial<RealBeneficiary> {
    delete model.searchFields;
    delete model.birthDateString;
    return model;
  }
}
