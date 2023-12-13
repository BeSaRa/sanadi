import { Profile } from '@app/models/profile';
import { NpoData } from './../models/npo-data';
import { AdminResult } from '../models/admin-result';
import { DateUtils } from '../helpers/date-utils';
import { IModelInterceptor } from '@contracts/i-model-interceptor';
import { NpoBankInterceptor } from './npo-bank-interceptor';
import { NpoBankAccount } from '@app/models/npo-bank-account';
import { BankAccount } from '@app/models/bank-account';
import { NpoDataService } from '@app/services/npo-data.service';
import { FactoryService } from '@app/services/factory.service';
import { RealBeneficiary } from '@app/models/real-beneficiary';
import { FounderMembers } from '@app/models/founder-members';


export class NpoDataInterceptor implements IModelInterceptor<NpoData> {
  receive(model: NpoData): NpoData {
    model.activityTypeInfo && (model.activityTypeInfo = AdminResult.createInstance(model.activityTypeInfo));
    model.clearanceInfo && (model.clearanceInfo = AdminResult.createInstance(model.clearanceInfo));
    model.disbandmentInfo && (model.disbandmentInfo = AdminResult.createInstance(model.disbandmentInfo));
    model.registrationAuthorityInfo && (model.registrationAuthorityInfo = AdminResult.createInstance(model.registrationAuthorityInfo));
    model.statusInfo && (model.statusInfo = AdminResult.createInstance(model.statusInfo));
    model.profileInfo && (model.profileInfo = Object.assign(new Profile, model.profileInfo));

    model.establishmentDate = DateUtils.changeDateToDatepicker(model.establishmentDate);
    model.disbandmentDate = DateUtils.changeDateToDatepicker(model.disbandmentDate);
    model.clearanceDate = DateUtils.changeDateToDatepicker(model.clearanceDate);
    model.registrationDate = DateUtils.changeDateToDatepicker(model.registrationDate);
    model.registrationDateString = DateUtils.getDateStringFromDate(model.registrationDate);
    model.establishmentDateString = DateUtils.getDateStringFromDate(model.establishmentDate);
    let service: NpoDataService = FactoryService.getService('NpoDataService');

    if (model.bankAccountList && model.bankAccountList.length > 0) {
      model.bankAccountList = model.bankAccountList.map(x => service.npoBankInterceptor.receive(new NpoBankAccount().clone(x)) as NpoBankAccount);
    }
    if (model.beneficiaryList && model.beneficiaryList.length > 0) {
      model.beneficiaryList = model.beneficiaryList.map(x => service.realBeneficiaryInterceptor.receive(new RealBeneficiary().clone(x)));
    }
    if (model.founderList && model.founderList.length > 0) {
      model.founderList = model.founderList.map(x => service.founderMembersInterceptor.receive(new FounderMembers().clone(x)));
    }

    return model;
  }

  send(model: NpoData): NpoData {
    // to used yet
    NpoDataInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<NpoData>): void {
    delete model.searchFields;
    delete model.activityTypeInfo;
    delete model.profileInfo;
    delete model.clearanceInfo;
    delete model.disbandmentInfo;
    delete model.registrationAuthorityInfo;
    delete model.statusInfo;
  }
}
