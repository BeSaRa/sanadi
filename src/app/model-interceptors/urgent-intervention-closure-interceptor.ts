import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {UrgentInterventionClosure} from '@app/models/urgent-intervention-closure';
import {ImplementingAgency} from '@app/models/implementing-agency';
import {InterventionRegion} from '@app/models/intervention-region';
import {InterventionField} from '@app/models/intervention-field';
import {FactoryService} from '@services/factory.service';
import {UrgentInterventionClosureService} from '@services/urgent-intervention-closure.service';
import {Result} from '@app/models/result';
import {OfficeEvaluation} from '@app/models/office-evaluation';
import {Stage} from '@app/models/stage';
import {BestPractices} from '@app/models/best-practices';
import {LessonsLearned} from '@app/models/lessons-learned';
import {AdminResult} from '@app/models/admin-result';

export class UrgentInterventionClosureInterceptor implements IModelInterceptor<UrgentInterventionClosure> {
  receive(model: UrgentInterventionClosure): UrgentInterventionClosure {
    model.requestTypeInfo && (model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo));
    model.beneficiaryCountryInfo && (model.beneficiaryCountryInfo = AdminResult.createInstance(model.beneficiaryCountryInfo));
    model.executionCountryInfo && (model.executionCountryInfo = AdminResult.createInstance(model.executionCountryInfo));
    let service: UrgentInterventionClosureService = FactoryService.getService('UrgentInterventionClosureService');
    if (model.implementingAgencyList && model.implementingAgencyList.length > 0) {
      model.implementingAgencyList = model.implementingAgencyList.map(x => service.implementingAgencyInterceptor.receive(new ImplementingAgency().clone(x)));
    }
    if (model.interventionRegionList && model.interventionRegionList.length > 0) {
      model.interventionRegionList = model.interventionRegionList.map(x => service.interventionRegionInterceptor.receive(new InterventionRegion().clone(x)));
    }
    if (model.interventionFieldList && model.interventionFieldList.length > 0) {
      model.interventionFieldList = model.interventionFieldList.map(x => service.interventionFieldInterceptor.receive(new InterventionField().clone(x)));
    }
    if (model.resultList && model.resultList.length > 0) {
      model.resultList = model.resultList.map(x => service.resultInterceptor.receive(new Result().clone(x)));
    }
    if (model.officeEvaluationList && model.officeEvaluationList.length > 0) {
      model.officeEvaluationList = model.officeEvaluationList.map(x => service.officeEvaluationInterceptor.receive(new OfficeEvaluation().clone(x)));
    }
    if (model.stageList && model.stageList.length > 0) {
      model.stageList = model.stageList.map(x => service.stageInterceptor.receive(new Stage().clone(x)));
    }
    if (model.bestPracticesList && model.bestPracticesList.length > 0) {
      model.bestPracticesList = model.bestPracticesList.map(x => service.bestPracticesInterceptor.receive(new BestPractices().clone(x)));
    }
    if (model.lessonsLearnedList && model.lessonsLearnedList.length > 0) {
      model.lessonsLearnedList = model.lessonsLearnedList.map(x => service.lessonsLearnedInterceptor.receive(new LessonsLearned().clone(x)));
    }
    return model;
  }

  send(model: Partial<UrgentInterventionClosure>): Partial<UrgentInterventionClosure> {
    let service: UrgentInterventionClosureService = FactoryService.getService('UrgentInterventionClosureService');
    if (model.implementingAgencyList && model.implementingAgencyList.length > 0) {
      model.implementingAgencyList = model.implementingAgencyList.map(x => service.implementingAgencyInterceptor.send(x) as ImplementingAgency);
    }
    if (model.interventionRegionList && model.interventionRegionList.length > 0) {
      model.interventionRegionList = model.interventionRegionList.map(x => service.interventionRegionInterceptor.send(x) as InterventionRegion);
    }
    if (model.interventionFieldList && model.interventionFieldList.length > 0) {
      model.interventionFieldList = model.interventionFieldList.map(x => service.interventionFieldInterceptor.send(x) as InterventionField);
    }
    if (model.resultList && model.resultList.length > 0) {
      model.resultList = model.resultList.map(x => service.resultInterceptor.send(x) as Result);
    }
    if (model.officeEvaluationList && model.officeEvaluationList.length > 0) {
      model.officeEvaluationList = model.officeEvaluationList.map(x => service.officeEvaluationInterceptor.send(x) as OfficeEvaluation);
    }
    if (model.stageList && model.stageList.length > 0) {
      model.stageList = model.stageList.map(x => service.stageInterceptor.send(x) as Stage);
    }
    if (model.bestPracticesList && model.bestPracticesList.length > 0) {
      model.bestPracticesList = model.bestPracticesList.map(x => service.bestPracticesInterceptor.send(x) as BestPractices);
    }
    if (model.lessonsLearnedList && model.lessonsLearnedList.length > 0) {
      model.lessonsLearnedList = model.lessonsLearnedList.map(x => service.lessonsLearnedInterceptor.send(x) as LessonsLearned);
    }
    UrgentInterventionClosureInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<UrgentInterventionClosure>): void {
    delete model.searchFields;
    delete model.requestTypeInfo;
    delete model.beneficiaryCountryInfo;
    delete model.executionCountryInfo;
  }
}
