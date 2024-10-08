import {IMyDateModel} from '@nodro7/angular-mydatepicker';
import {DateUtils} from './../helpers/date-utils';
import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {AdminResult} from '@app/models/admin-result';
import {ForeignCountriesProjects} from '@app/models/foreign-countries-projects';
import {ProjectNeed} from '@app/models/project-needs';

export class ForeignCountriesProjectsInterceptor implements IModelInterceptor<ForeignCountriesProjects> {
  caseInterceptor?: IModelInterceptor<ForeignCountriesProjects> | undefined;

  send(model: Partial<ForeignCountriesProjects>): Partial<ForeignCountriesProjects> {
    model.followUpDate = !model.followUpDate ? undefined
      : DateUtils.changeDateFromDatepicker(model.followUpDate as unknown as IMyDateModel)?.toISOString();

    model.projectNeeds?.forEach((e: Partial<ProjectNeed>) => {
      delete e.searchFields;
    });

    ForeignCountriesProjectsInterceptor._deleteBeforeSend(model);
    return model;
  }

  receive(model: ForeignCountriesProjects): ForeignCountriesProjects {
    model.requestTypeInfo && (model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo));
    model.countryInfo && (model.countryInfo = AdminResult.createInstance(model.countryInfo));
    model.externalCooperationAuthorityInfo && (model.externalCooperationAuthorityInfo = AdminResult.createInstance(model.externalCooperationAuthorityInfo));
    model.projectNeeds = model.projectNeeds.map(e => (new ProjectNeed()).clone({...e}));
    // model.projectNeedList = model.projectNeeds.map(e => (new ProjectNeed()).clone({ ...e }));
    model.followUpDate = DateUtils.changeDateToDatepicker(model.followUpDate);

    return model;
  }

  private static _deleteBeforeSend(model: Partial<ForeignCountriesProjects>): void {
    delete model.service;
    delete model.employeeService;
    delete model.inboxService;
    delete model.requestTypeInfo;
    delete model.countryInfo;
    delete model.externalCooperationAuthorityInfo;
  }
}
