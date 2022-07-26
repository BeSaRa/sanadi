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

    let customSettings: ServiceCustomSettings;
    // parse custom settings string to model properties
    try {
      customSettings = model.customSettings ? JSON.parse(model.customSettings) : {};
      customSettings = new ServiceCustomSettings().clone(customSettings);
    }  catch (e) {
      customSettings = new ServiceCustomSettings();
    }
    model.maxTargetAmount = customSettings.maxTargetAmount!;
    model.maxElementsCount = customSettings.maxElementsCount!;
    model.activateDevelopmentField = customSettings.activateDevelopmentField || false;
    model.attachmentID = customSettings.attachmentID!;

    return model;
  }

  static send(model: Partial<ServiceData>): Partial<ServiceData> {
    model.caseType = Number(model.caseType);
    ServiceDataInterceptor._setCustomSettingsForSend(model);
    ServiceDataInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _setCustomSettingsForSend(model: Partial<ServiceData>): void {
    // stringify custom settings object
    let record = (model as ServiceData);
    if (!(model as ServiceData).hasCustomSettings()) {
      model.customSettings = '';
    } else {
      let customSettings = new ServiceCustomSettings();
      if (record.isUrgentInterventionLicensing()) {
        customSettings.maxTargetAmount = model.maxTargetAmount;
        delete customSettings.maxElementsCount;
        delete customSettings.activateDevelopmentField;
        delete customSettings.attachmentID;
      } else if (record.isCollectorLicensing()) {
        customSettings.maxElementsCount = model.maxElementsCount;
        delete customSettings.maxTargetAmount;
        delete customSettings.activateDevelopmentField;
        delete customSettings.attachmentID;
      } else if (record.isExternalProjectModels()) {
        customSettings.activateDevelopmentField = !!model.activateDevelopmentField;
        delete customSettings.maxTargetAmount;
        delete customSettings.maxElementsCount;
        delete customSettings.attachmentID;
      } else if (record.isCustomExemption()) {
        customSettings.attachmentID = model.attachmentID!;
        delete customSettings.maxTargetAmount;
        delete customSettings.maxElementsCount;
        delete customSettings.activateDevelopmentField;
      }

      model.customSettings = JSON.stringify(customSettings);
    }
  }

  private static _deleteBeforeSend(model: Partial<ServiceData>): void {
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
  }

}
