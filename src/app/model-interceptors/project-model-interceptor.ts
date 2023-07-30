import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {ProjectModel} from '@app/models/project-model';
import {ProjectComponent} from '@app/models/project-component';
import {AdminResult} from '@app/models/admin-result';
import {TaskDetails} from '@app/models/task-details';
import {EvaluationIndicator} from '@app/models/evaluation-indicator';
import {ProjectModelForeignCountriesProject} from '@app/models/project-model-foreign-countries-project';
import {ProjectAddress} from '@app/models/project-address';
import {ProjectComponentInterceptor} from "@model-interceptors/project-component-interceptor";

const projectComponentInterceptor = new ProjectComponentInterceptor();

export class ProjectModelInterceptor implements IModelInterceptor<ProjectModel> {
  send(model: Partial<ProjectModel>): Partial<ProjectModel> {
    model.componentList = (model.componentList || []).map(item => {
      return projectComponentInterceptor.send(new ProjectComponent().clone(item)) as ProjectComponent;
    });
    model.evaluationIndicatorList = (model.evaluationIndicatorList ?? []).map(item => {
      item = new EvaluationIndicator().clone(item);
      delete (item as Partial<EvaluationIndicator>).searchFields;
      delete (item as Partial<EvaluationIndicator>).auditOperation;
      return item;
    });
    model.foreignCountriesProjectList = (model.foreignCountriesProjectList ?? []).map(item => {
      delete (item as Partial<ProjectModelForeignCountriesProject>).searchFields;
      delete (item as Partial<ProjectModelForeignCountriesProject>).auditOperation;
      return item;
    });
    model.projectAddressList = (model.projectAddressList ?? []).map(item => {
      delete item.mapService;
      delete item.defaultLatLng;
      delete (item as Partial<ProjectAddress>).searchFields;
      delete (item as Partial<ProjectAddress>).auditOperation;
      return item;
    });
    delete model.requestTypeInfo;
    delete model.templateStatusInfo;
    delete model.projectTypeInfo;
    delete model.beneficiaryCountryInfo;
    delete model.executionCountryInfo;
    delete model.domainInfo;
    delete model.mainUNOCHACategoryInfo;
    delete model.subUNOCHACategoryInfo;
    delete model.mainDACCategoryInfo;
    delete model.subDACCategoryInfo;
    delete model.firstSDGoalInfo;
    delete model.secondSDGoalInfo;
    delete model.thirdSDGoalInfo;
    delete model.caseStatusInfo;
    delete model.creatorInfo;
    delete model.taskDetails;
    delete model.ouInfo;
    delete model.projectWorkAreaInfo;
    delete model.internalProjectClassificationInfo;
    delete model.sanadiDomainInfo;
    delete model.sanadiMainClassificationInfo;
    delete model.exitMechanismInfo;
    return model;
  }

  receive(model: ProjectModel): ProjectModel {
    model.taskDetails = (new TaskDetails()).clone(model.taskDetails);
    model.ouInfo = AdminResult.createInstance(model.ouInfo);
    model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo);
    model.templateStatusInfo = AdminResult.createInstance(model.templateStatusInfo);
    model.projectTypeInfo = AdminResult.createInstance(model.projectTypeInfo);
    model.beneficiaryCountryInfo = AdminResult.createInstance(model.beneficiaryCountryInfo);
    model.executionCountryInfo = AdminResult.createInstance(model.executionCountryInfo);
    model.beneficiaryCountryInfo = AdminResult.createInstance(model.beneficiaryCountryInfo);
    model.domainInfo = AdminResult.createInstance(model.domainInfo);
    model.mainUNOCHACategoryInfo = AdminResult.createInstance(model.mainUNOCHACategoryInfo);
    model.subUNOCHACategoryInfo = AdminResult.createInstance(model.subUNOCHACategoryInfo);
    model.mainDACCategoryInfo = AdminResult.createInstance(model.mainDACCategoryInfo);
    model.subDACCategoryInfo = AdminResult.createInstance(model.subDACCategoryInfo);
    model.firstSDGoalInfo = AdminResult.createInstance(model.firstSDGoalInfo);
    model.secondSDGoalInfo = AdminResult.createInstance(model.secondSDGoalInfo);
    model.thirdSDGoalInfo = AdminResult.createInstance(model.thirdSDGoalInfo);
    model.caseStatusInfo = AdminResult.createInstance(model.caseStatusInfo);
    model.creatorInfo = AdminResult.createInstance(model.creatorInfo);
    model.projectWorkAreaInfo = AdminResult.createInstance(model.projectWorkAreaInfo);
    model.internalProjectClassificationInfo = AdminResult.createInstance(model.internalProjectClassificationInfo);
    model.sanadiDomainInfo = AdminResult.createInstance(model.sanadiDomainInfo);
    model.sanadiMainClassificationInfo = AdminResult.createInstance(model.sanadiMainClassificationInfo);
    model.exitMechanismInfo = AdminResult.createInstance(model.exitMechanismInfo);
    model.evaluationIndicatorList = model.evaluationIndicatorList.map(item => {
      return new EvaluationIndicator().clone(item);
    });
    model.foreignCountriesProjectList = model.foreignCountriesProjectList.map(item => {
      return new ProjectModelForeignCountriesProject().clone(item);
    });
    model.projectAddressList = model.projectAddressList.map(item => {
      return new ProjectAddress().clone(item);
    });
    model.componentList = (model.componentList || []).map(item => {
      return projectComponentInterceptor.receive(new ProjectComponent().clone(item));
    });
    return model;
  }
}
