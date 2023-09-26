import {IMyDateModel} from 'angular-mydatepicker';
import {DateUtils} from '@app/helpers/date-utils';
import {ContactOfficer} from './../models/contact-officer';
import {BankAccount} from './../models/bank-account';
import {ExecutiveManagement} from './../models/executive-management';
import {ContactOfficerInterceptor} from './ContactOfficerInterceptor';
import {ExecutiveManagementInterceptor} from './executive-management-interceptor';
import {BankAccountInterceptor} from './bank-account-interceptor';
import {ExternalOrgAffiliation} from './../models/external-org-affiliation';
import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {AdminResult} from '@app/models/admin-result';

const bankAccountInterceptor = new BankAccountInterceptor();
const executiveManagementInterceptor = new ExecutiveManagementInterceptor();
const contactOfficerInterceptor = new ContactOfficerInterceptor()

export class ExternalOrgAffiliationInterceptor implements IModelInterceptor<ExternalOrgAffiliation> {
  send(model: Partial<ExternalOrgAffiliation>): Partial<ExternalOrgAffiliation> {
    model.bankAccountDTOs = model.bankAccountDTOs?.map(ba => {
      return bankAccountInterceptor.send(new BankAccount().clone(ba)) as BankAccount;
    })
    model.executiveManagementDTOs = model.executiveManagementDTOs?.map(em => executiveManagementInterceptor.send(em) as ExecutiveManagement)
    model.contactOfficerDTOs = model.contactOfficerDTOs?.map(co => contactOfficerInterceptor.send(co) as ContactOfficer)
    model.followUpDate = !model.followUpDate
      ? undefined
      : DateUtils.changeDateFromDatepicker(
        model.followUpDate as unknown as IMyDateModel
      )?.toISOString();

    delete model.caseStatusInfo
    delete model.categoryInfo
    delete model.countryInfo
    delete model.creatorInfo
    delete model.ouInfo
    delete model.requestTypeInfo
    delete model.searchFields;
    return model;
  }

  receive(model: ExternalOrgAffiliation): ExternalOrgAffiliation {
    model.requestTypeInfo && (model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo));
    model.followUpDate = DateUtils.changeDateToDatepicker(model.followUpDate);
    model.bankAccountDTOs = model.bankAccountDTOs?.map(ba => bankAccountInterceptor.receive(new BankAccount().clone(ba)))
    model.executiveManagementDTOs = model.executiveManagementDTOs?.map(em => executiveManagementInterceptor.receive(new ExecutiveManagement().clone(em)))
    model.contactOfficerDTOs = model.contactOfficerDTOs?.map(co => contactOfficerInterceptor.receive(new ContactOfficer().clone(co)))
    model.countryInfo && (model.countryInfo = AdminResult.createInstance(model.countryInfo??{}))
    return model;
  }

}
