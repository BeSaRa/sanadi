import { AdminResult } from '@app/models/admin-result';
import { ExternalOrgAffiliationResult } from './../models/external-org-affiliation-result';
import { ContactOfficer } from './../models/contact-officer';
import { BankAccount } from './../models/bank-account';
import { ExecutiveManagement } from './../models/executive-management';
import { ContactOfficerInterceptor } from './ContactOfficerInterceptor';
import { ExecutiveManagementInterceptor } from './executive-management-interceptor';
import { BankAccountInterceptor } from './bank-account-interceptor';
import { IModelInterceptor } from './../interfaces/i-model-interceptor';

const bankAccountInterceptor = new BankAccountInterceptor();
const executiveManagementInterceptor = new ExecutiveManagementInterceptor();
const contactOfficerInterceptor = new ContactOfficerInterceptor()
export class ExternalOrgAffiliationResultInterceptor implements IModelInterceptor<ExternalOrgAffiliationResult> {
  send(model: Partial<ExternalOrgAffiliationResult>): Partial<ExternalOrgAffiliationResult> {
    model.bankAccountDTOs = model.bankAccountDTOs?.map(ba => {
      const newBa = bankAccountInterceptor.send(ba) as BankAccount
      delete newBa.category
      return newBa
    })
    model.executiveManagementDTOs = model.executiveManagementDTOs?.map(em => executiveManagementInterceptor.send(em) as ExecutiveManagement)
    model.contactOfficerDTOs = model.contactOfficerDTOs?.map(co => contactOfficerInterceptor.send(co) as ContactOfficer)

    delete model.categoryInfo
    delete model.countryInfo
    delete model.creatorInfo
    delete model.licenseStatusInfo
    delete model.ouInfo
    delete model.requestTypeInfo
    return model;
  }
  receive(model: ExternalOrgAffiliationResult): ExternalOrgAffiliationResult {
    model.categoryInfo = AdminResult.createInstance(model.categoryInfo);
    model.countryInfo = AdminResult.createInstance(model.countryInfo);
    model.creatorInfo = AdminResult.createInstance(model.creatorInfo);
    model.licenseStatusInfo = AdminResult.createInstance(model.licenseStatusInfo);
    model.ouInfo = AdminResult.createInstance(model.ouInfo);
    model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo);

    model.bankAccountDTOs = model.bankAccountDTOs?.map(ba => bankAccountInterceptor.receive(new BankAccount().clone(ba)))
    model.executiveManagementDTOs = model.executiveManagementDTOs?.map(em => executiveManagementInterceptor.receive(new ExecutiveManagement().clone(em)))
    model.contactOfficerDTOs = model.contactOfficerDTOs?.map(co => contactOfficerInterceptor.receive(new ContactOfficer().clone(co)))
    return model;
  }

}
