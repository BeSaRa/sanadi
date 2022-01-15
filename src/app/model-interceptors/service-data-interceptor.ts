import {ServiceData} from '../models/service-data';
import {isValidAdminResult} from '../helpers/utils';
import {AdminResult} from '../models/admin-result';
import {DateUtils} from '../helpers/date-utils';
import {ServiceCustomSettings} from '@app/models/service-custom-settings';

export class ServiceDataInterceptor {
  static receive(model: ServiceData): ServiceData {
    model.statusInfo = isValidAdminResult(model.statusInfo) ? AdminResult.createInstance(model.statusInfo) : model.statusInfo;
    model.statusDateModifiedString = DateUtils.getDateStringFromDate(model.statusDateModified, 'DEFAULT_DATE_FORMAT');

    model.updatedOnString = DateUtils.getDateStringFromDate(model.updatedOn, 'DEFAULT_DATE_FORMAT');
    model.updatedByInfo = AdminResult.createInstance(model.updatedByInfo);

    // parse custom settings string to model properties
    let customSettingsOb = model.customSettings ? JSON.parse(model.customSettings) : new ServiceCustomSettings();
    model.maxTargetAmount = customSettingsOb.maxTargetAmount!;
    model.maxElementsCount = customSettingsOb?.maxElementsCount!;
    model.activateDevelopmentField = customSettingsOb.activateDevelopmentField ? customSettingsOb.activateDevelopmentField : false;

    return model;
  }

  static send(model: Partial<ServiceData>): Partial<ServiceData> {
    model.caseType = Number(model.caseType);

    let customSettings = new ServiceCustomSettings();
    // stringify custom settings object
    if(!(model as ServiceData).hasCustomSettings()) {
      model.customSettings = "";
    } else {
      if((model as ServiceData).isUrgentInterventionLicensing()) {
        customSettings.maxTargetAmount = model.maxTargetAmount;
        delete customSettings.maxElementsCount;
        // @ts-ignore
        delete customSettings.activateDevelopmentField;
      } else if((model as ServiceData).isCollectorLicensing()) {
        customSettings.maxElementsCount = model.maxElementsCount;
        delete customSettings.maxTargetAmount;
        // @ts-ignore
        delete customSettings.activateDevelopmentField;
      } else if((model as ServiceData).isExternalProjectModels()) {
        customSettings.activateDevelopmentField = model.activateDevelopmentField!;
        delete customSettings.maxTargetAmount;
        delete customSettings.maxElementsCount;
      }

      model.customSettings = JSON.stringify(customSettings);
    }

    delete model.service;
    delete model.langService;
    delete model.lookupService;
    delete model.searchFields;
    delete model.statusInfo;
    delete model.statusDateModifiedString;
    delete model.updatedByInfo;

    delete model.maxTargetAmount;
    delete model.maxElementsCount;
    delete model.activateDevelopmentField;

    return model;
  }

}
