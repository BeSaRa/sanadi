import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {TransferringIndividualFundsAbroad} from '@app/models/transferring-individual-funds-abroad';
import {DateUtils} from '@helpers/date-utils';
import {FactoryService} from '@services/factory.service';
import {TransferringIndividualFundsAbroadService} from '@services/transferring-individual-funds-abroad.service';
import {TransferFundsExecutiveManagement} from '@app/models/transfer-funds-executive-management';
import {TransferFundsCharityPurpose} from '@app/models/transfer-funds-charity-purpose';
import {AdminResult} from '@app/models/admin-result';
import {Payment} from '@app/models/payment';
import {PaymentInterceptor} from "@model-interceptors/payment-interceptor";
import {ExecutiveManagementListInterceptor} from "@model-interceptors/executive-management-list-interceptor";
import {TransferFundsCharityPurposeInterceptor} from "@model-interceptors/transfer-funds-charity-purpose-interceptor";

const executiveManagementListInterceptor = new ExecutiveManagementListInterceptor();
const transferFundsCharityPurposeInterceptor = new TransferFundsCharityPurposeInterceptor();
const tifaPaymentInterceptor = new PaymentInterceptor();

export class TransferringIndividualFundsAbroadInterceptor implements IModelInterceptor<TransferringIndividualFundsAbroad> {
  caseInterceptor?: IModelInterceptor<TransferringIndividualFundsAbroad> | undefined;

  send(model: Partial<TransferringIndividualFundsAbroad>): Partial<TransferringIndividualFundsAbroad> {
    model.executiveManagementList = (model.executiveManagementList ?? []).map(x => executiveManagementListInterceptor.send(x) as TransferFundsExecutiveManagement);
    model.charityPurposeTransferList = (model.charityPurposeTransferList ?? []).map(x => transferFundsCharityPurposeInterceptor.send(x) as TransferFundsCharityPurpose);
    model.payment = (model.payment ?? []).map(x => tifaPaymentInterceptor.send(x) as Payment);

    model.establishmentDate = DateUtils.getDateStringFromDate(model.establishmentDate);

    TransferringIndividualFundsAbroadInterceptor._deleteBeforeSend(model);
    return model;
  }

  receive(model: TransferringIndividualFundsAbroad): TransferringIndividualFundsAbroad {
    let service: TransferringIndividualFundsAbroadService = FactoryService.getService('TransferringIndividualFundsAbroadService');
    model.establishmentDate = DateUtils.changeDateToDatepicker(model.establishmentDate);
    model.licenseStatusInfo = model.licenseStatusInfo ? AdminResult.createInstance(model.licenseStatusInfo) : AdminResult.createInstance({});
    model.managerDecisionInfo = model.managerDecisionInfo ? AdminResult.createInstance(model.managerDecisionInfo) : AdminResult.createInstance({});
    model.reviewerDepartmentDecisionInfo = model.reviewerDepartmentDecisionInfo ? AdminResult.createInstance(model.reviewerDepartmentDecisionInfo) : AdminResult.createInstance({});
    model.specialistDecisionInfo = model.specialistDecisionInfo ? AdminResult.createInstance(model.specialistDecisionInfo) : AdminResult.createInstance({});
    model.chiefDecisionInfo = model.chiefDecisionInfo ? AdminResult.createInstance(model.chiefDecisionInfo) : AdminResult.createInstance({});
    model.requestTypeInfo = model.requestTypeInfo ? AdminResult.createInstance(model.requestTypeInfo) : AdminResult.createInstance({});
    model.transfereeTypeInfo = model.transfereeTypeInfo ? AdminResult.createInstance(model.transfereeTypeInfo) : AdminResult.createInstance({});
    model.domainInfo = model.domainInfo ? AdminResult.createInstance(model.domainInfo) : AdminResult.createInstance({});
    model.mainDACCategoryInfo = model.mainDACCategoryInfo ? AdminResult.createInstance(model.mainDACCategoryInfo) : AdminResult.createInstance({});
    model.mainUNOCHACategoryInfo = model.mainUNOCHACategoryInfo ? AdminResult.createInstance(model.mainUNOCHACategoryInfo) : AdminResult.createInstance({});
    model.beneficiaryCountryInfo = model.beneficiaryCountryInfo ? AdminResult.createInstance(model.beneficiaryCountryInfo) : AdminResult.createInstance({});
    model.executionCountryInfo = model.executionCountryInfo ? AdminResult.createInstance(model.executionCountryInfo) : AdminResult.createInstance({});
    model.countryInfo = model.countryInfo ? AdminResult.createInstance(model.countryInfo) : AdminResult.createInstance({});
    model.transferCountryInfo = model.transferCountryInfo ? AdminResult.createInstance(model.transferCountryInfo) : AdminResult.createInstance({});
    model.nationalityInfo = model.nationalityInfo ? AdminResult.createInstance(model.nationalityInfo) : AdminResult.createInstance({});
    model.ReceiverNationalityInfo = model.ReceiverNationalityInfo ? AdminResult.createInstance(model.ReceiverNationalityInfo) : AdminResult.createInstance({});
    model.headQuarterTypeInfo = model.headQuarterTypeInfo ? AdminResult.createInstance(model.headQuarterTypeInfo) : AdminResult.createInstance({});
    model.currencyInfo = model.currencyInfo ? AdminResult.createInstance(model.currencyInfo) : AdminResult.createInstance({});
    model.projectTypeInfo = model.projectTypeInfo ? AdminResult.createInstance(model.projectTypeInfo) : AdminResult.createInstance({});
    model.transferMethodInfo = model.transferMethodInfo ? AdminResult.createInstance(model.transferMethodInfo) : AdminResult.createInstance({});
    model.transferTypeInfo = model.transferTypeInfo ? AdminResult.createInstance(model.transferTypeInfo) : AdminResult.createInstance({});
    model.receiverNationalityInfo = model.receiverNationalityInfo ? AdminResult.createInstance(model.receiverNationalityInfo) : AdminResult.createInstance({});

    if (model.executiveManagementList && model.executiveManagementList.length > 0) {
      model.executiveManagementList = model.executiveManagementList.map(x => executiveManagementListInterceptor.receive(new TransferFundsExecutiveManagement().clone(x)) as TransferFundsExecutiveManagement);
    }

    if (model.charityPurposeTransferList && model.charityPurposeTransferList.length > 0) {
      model.charityPurposeTransferList = model.charityPurposeTransferList.map(x => transferFundsCharityPurposeInterceptor.receive(new TransferFundsCharityPurpose().clone(x)) as TransferFundsCharityPurpose);
    }

    if (model.payment && model.payment.length > 0) {
      model.payment = model.payment.map(x => tifaPaymentInterceptor.receive(new Payment().clone(x)));
    }

    return model;
  }

  private static _deleteBeforeSend(model: Partial<TransferringIndividualFundsAbroad>): void {
    delete model.licenseStatusInfo;
    delete model.managerDecisionInfo;
    delete model.reviewerDepartmentDecisionInfo;
    delete model.specialistDecisionInfo;
    delete model.chiefDecisionInfo;
    delete model.requestTypeInfo;
    delete model.transfereeTypeInfo;
    delete model.domainInfo;
    delete model.mainDACCategoryInfo;
    delete model.mainUNOCHACategoryInfo;
    delete model.beneficiaryCountryInfo;
    delete model.executionCountryInfo;
    delete model.countryInfo;
    delete model.transferCountryInfo;
    delete model.nationalityInfo;
    delete model.ReceiverNationalityInfo;
    delete model.headQuarterTypeInfo;
    delete model.currencyInfo;
    delete model.projectTypeInfo;
    delete model.transferMethodInfo;
    delete model.transferTypeInfo;
    delete model.receiverNationalityInfo;
    delete model.employeeService;
    delete model.encrypt;
    delete model.searchFields;
    delete model.service;
  }
}
