import { Profile } from '@app/models/profile';
import { NpoBankInterceptor } from './npo-bank-interceptor';
import { NpoContactOfficerInterceptor } from './NpoContactOfficerInterceptor';
import { RealBeneficiary } from '@app/models/real-beneficiary';
import { NpoBankAccount } from './../models/npo-bank-account';
import { FounderMembers } from '@app/models/founder-members';
import { NpoContactOfficer } from '@app/models/npo-contact-officer';
import { RealBeneficiaryInterceptor } from '@app/model-interceptors/real-beneficiary-interceptors';
import { AdminResult } from './../models/admin-result';
import { DateUtils } from './../helpers/date-utils';
import { IMyDateModel } from 'angular-mydatepicker';
import { NpoManagement } from './../models/npo-management';
import { IModelInterceptor } from '@contracts/i-model-interceptor';
import { FounderInterceptor } from './founder-interceptor';

const contactOffercireInter = new NpoContactOfficerInterceptor();
const founderInter = new FounderInterceptor();
const bankInter = new NpoBankInterceptor();
const realBeneInter = new RealBeneficiaryInterceptor();

export class NpoManagementInterceptor implements IModelInterceptor<NpoManagement> {
  receive(model: NpoManagement): NpoManagement {

    model.requestTypeInfo && (model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo));
    model.activityTypeInfo && (model.activityTypeInfo = AdminResult.createInstance(model.activityTypeInfo));
    model.profileInfo && (model.profileInfo = Object.assign(new Profile, model.profileInfo));
    model.clearanceInfo && (model.clearanceInfo = AdminResult.createInstance(model.clearanceInfo));
    model.disbandmentInfo && (model.disbandmentInfo = AdminResult.createInstance(model.disbandmentInfo));
    model.registrationAuthorityInfo && (model.registrationAuthorityInfo = AdminResult.createInstance(model.registrationAuthorityInfo));

    model.establishmentDate = DateUtils.changeDateToDatepicker(model.establishmentDate);
    model.disbandmentDate = DateUtils.changeDateToDatepicker(model.disbandmentDate);
    model.clearanceDate = DateUtils.changeDateToDatepicker(model.clearanceDate);
    model.registrationDate = DateUtils.changeDateToDatepicker(model.registrationDate);
    model.followUpDate = DateUtils.changeDateToDatepicker(model.followUpDate);

    model.contactOfficerList = model.contactOfficerList.map(ei => {
      return contactOffercireInter.receive(new NpoContactOfficer().clone(ei));
    })
    model.founderMemberList = model.founderMemberList.map(ei => {
      return founderInter.receive(new FounderMembers().clone(ei));
    })
    model.bankAccountList = model.bankAccountList.map(ei => {
      return bankInter.receive(new NpoBankAccount().clone(ei));
    })
    model.realBeneficiaryList = model.realBeneficiaryList.map(ei => {
      return realBeneInter.receive(new RealBeneficiary().clone(ei));
    })

    return model;
  }

  send(model: any): NpoManagement {
    model.establishmentDate = !model.establishmentDate
      ? undefined
      : DateUtils.changeDateFromDatepicker(
        model.establishmentDate as unknown as IMyDateModel
      )?.toISOString();
    model.disbandmentDate = !model.disbandmentDate
      ? undefined
      : DateUtils.changeDateFromDatepicker(
        model.disbandmentDate as unknown as IMyDateModel
      )?.toISOString();
    model.clearanceDate = !model.clearanceDate
      ? undefined
      : DateUtils.changeDateFromDatepicker(
        model.clearanceDate as unknown as IMyDateModel
      )?.toISOString();
    model.registrationDate = !model.registrationDate
      ? undefined
      : DateUtils.changeDateFromDatepicker(
        model.registrationDate as unknown as IMyDateModel
      )?.toISOString();
    model.followUpDate = !model.followUpDate
      ? undefined
      : DateUtils.changeDateFromDatepicker(
        model.followUpDate as unknown as IMyDateModel
      )?.toISOString();


    model.contactOfficerList = model.contactOfficerList.map((ei: any) => {
      return contactOffercireInter.send(ei) as unknown as NpoContactOfficer;
    });
    model.founderMemberList = model.founderMemberList.map((ei: any) => {
      return founderInter.send(ei) as unknown as FounderMembers;
    });
    model.bankAccountList = model.bankAccountList.map((ei: any) => {
      return bankInter.send(ei) as unknown as NpoBankAccount;
    });
    model.realBeneficiaryList = model.realBeneficiaryList.map((ei: any) => {
      return realBeneInter.send(ei) as unknown as RealBeneficiary;
    });

    NpoManagementInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<NpoManagement>): void {
    delete model.searchFields;
    delete model.requestTypeInfo;
    delete model.profileInfo;
    delete model.activityTypeInfo;
    delete model.clearanceInfo;
    delete model.disbandmentInfo;
    delete model.registrationAuthorityInfo;
  }
}
