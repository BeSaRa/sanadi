import {IModelInterceptor} from "@contracts/i-model-interceptor";
import {ProjectFundraising} from "@app/models/project-fundraising";
import {AdminResult} from "@app/models/admin-result";
import {ProjectTemplate} from "@app/models/projectTemplate";
import {DeductedPercentage} from "@app/models/deducted-percentage";
import {AmountOverYear} from "@app/models/amount-over-year";
import {AmountOverCountry} from "@app/models/amount-over-country";

export class ProjectFundraisingInterceptor implements IModelInterceptor<ProjectFundraising> {

  send(model: Partial<ProjectFundraising>): Partial<ProjectFundraising> {

    model.beforeSend!()
    ProjectFundraisingInterceptor._deleteBeforeSend(model);

    console.log(model);
    return model;
  }

  receive(model: ProjectFundraising): ProjectFundraising {
    model.templateList = model.templateList ? model.templateList.map(item => new ProjectTemplate().clone({
      ...item,
      templateStatusInfo: AdminResult.createInstance(item.templateStatusInfo)
    })) : []
    model.deductedPercentagesItemList = model.deductedPercentagesItemList ? model.deductedPercentagesItemList.map(item => new DeductedPercentage().clone({
      ...item,
      deductionTypeInfo: AdminResult.createInstance(item.deductionTypeInfo)
    })) : []
    model.amountOverYearsList = model.amountOverYearsList ? model.amountOverYearsList.map(item => new AmountOverYear().clone({...item})) : []
    model.amountOverCountriesList = model.amountOverCountriesList ? model.amountOverCountriesList.map(item => new AmountOverCountry().clone({
      ...item,
      countryInfo: AdminResult.createInstance(item.countryInfo)
    })) : []
    model.countriesInfo = model.countriesInfo ? model.countriesInfo.map(item => AdminResult.createInstance(item)) : []

    model.domainInfo = AdminResult.createInstance(model.domainInfo)
    model.workAreaInfo = AdminResult.createInstance(model.workAreaInfo)
    model.permitTypeInfo = AdminResult.createInstance(model.permitTypeInfo)
    model.projectTypeInfo = AdminResult.createInstance(model.projectTypeInfo)
    model.mainDACCategoryInfo = AdminResult.createInstance(model.mainDACCategoryInfo)
    model.mainUNOCHACategoryInfo = AdminResult.createInstance(model.mainUNOCHACategoryInfo)
    model.subUNOCHACategoryInfo = AdminResult.createInstance(model.subUNOCHACategoryInfo)
    model.subDACCategoryInfo = AdminResult.createInstance(model.subDACCategoryInfo)
    model.internalProjectClassificationInfo = AdminResult.createInstance(model.internalProjectClassificationInfo)
    model.sanadiDomainInfo = AdminResult.createInstance(model.sanadiDomainInfo)
    model.sanadiMainClassificationInfo = AdminResult.createInstance(model.sanadiMainClassificationInfo)
    model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo)

    return model
  }

  static _deleteBeforeSend(model: Partial<ProjectFundraising>): void {
    delete model.employeeService;
    delete model.domainInfo
    delete model.workAreaInfo
    delete model.permitTypeInfo
    delete model.projectTypeInfo
    delete model.mainDACCategoryInfo
    delete model.mainUNOCHACategoryInfo
    delete model.subUNOCHACategoryInfo
    delete model.subDACCategoryInfo
    delete model.internalProjectClassificationInfo
    delete model.sanadiDomainInfo
    delete model.sanadiMainClassificationInfo
    delete model.requestTypeInfo
    delete model.licenseStatusInfo
    delete model.countriesInfo
    delete model.licenseDurationType
    delete model.itemId
  }
}
