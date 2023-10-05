import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {UrgentInterventionAnnouncementResult} from '@app/models/urgent-intervention-announcement-result';
import {AdminResult} from '@app/models/admin-result';
import {LessonsLearnedInterceptor} from '@app/model-interceptors/lessons-learned-interceptor';
import {BestPracticesInterceptor} from '@app/model-interceptors/best-practices-interceptor';
import {OfficeEvaluationInterceptor} from '@app/model-interceptors/office-evaluation-interceptor';
import {StageInterceptor} from '@app/model-interceptors/stage-interceptor';
import {BestPractices} from '@app/models/best-practices';
import {LessonsLearned} from '@app/models/lessons-learned';
import {OfficeEvaluation} from '@app/models/office-evaluation';
import {Stage} from '@app/models/stage';
import {Result} from '@app/models/result';
import {ResultInterceptor} from '@app/model-interceptors/result-interceptor';
import {ImplementingAgencyInterceptor} from '@app/model-interceptors/implementing-agency-interceptor';
import {InterventionRegionInterceptor} from '@app/model-interceptors/intervention-region-interceptor';
import {InterventionFieldInterceptor} from '@app/model-interceptors/intervention-field-interceptor';
import {ImplementingAgency} from '@app/models/implementing-agency';
import {InterventionRegion} from '@app/models/intervention-region';
import {InterventionField} from '@app/models/intervention-field';

let lessonsLearnedInterceptor = new LessonsLearnedInterceptor();
let bestPracticesInterceptor = new BestPracticesInterceptor();
let officeEvaluationInterceptor = new OfficeEvaluationInterceptor();
let resultInterceptor = new ResultInterceptor();
let stageInterceptor = new StageInterceptor();
let implementingAgencyInterceptor = new ImplementingAgencyInterceptor();
let interventionRegionInterceptor = new InterventionRegionInterceptor();
let interventionFieldInterceptor = new InterventionFieldInterceptor();

export class UrgentInterventionAnnouncementResultInterceptor implements IModelInterceptor<UrgentInterventionAnnouncementResult> {
  receive(model: UrgentInterventionAnnouncementResult): UrgentInterventionAnnouncementResult {
    model.beneficiaryCountryInfo && (model.beneficiaryCountryInfo = AdminResult.createInstance(model.beneficiaryCountryInfo));
    model.executionCountryInfo && (model.executionCountryInfo = AdminResult.createInstance(model.executionCountryInfo));
    model.ouInfo && (model.ouInfo = AdminResult.createInstance(model.ouInfo));
    model.implementingAgencyList = model.implementingAgencyList.map((x: any) => {
      return implementingAgencyInterceptor.receive(new ImplementingAgency().clone(x));
    });
    model.interventionRegionList = model.interventionRegionList.map((x: any) => {
      return interventionRegionInterceptor.receive(new InterventionRegion().clone(x));
    });
    model.interventionFieldList = model.interventionFieldList.map((x: any) => {
      return interventionFieldInterceptor.receive(new InterventionField().clone(x));
    });
    model.officeEvaluationList = model.officeEvaluationList.map((x: any) => {
      return officeEvaluationInterceptor.receive(new OfficeEvaluation().clone(x));
    });
    model.bestPracticesList = model.bestPracticesList.map((x: any) => {
      return bestPracticesInterceptor.receive(new BestPractices().clone(x));
    });
    model.lessonsLearnedList = model.lessonsLearnedList.map((x: any) => {
      return lessonsLearnedInterceptor.receive(new LessonsLearned().clone(x));
    });
    model.resultList = model.resultList.map((x: any) => {
      return resultInterceptor.receive(new Result().clone(x));
    });
    model.stageList = model.stageList.map((x: any) => {
      return stageInterceptor.receive(new Stage().clone(x));
    });
    return model;
  }

  send(model: Partial<UrgentInterventionAnnouncementResult>): Partial<UrgentInterventionAnnouncementResult> {
    model.implementingAgencyList = model.implementingAgencyList?.map((x: any) => implementingAgencyInterceptor.send(x) as ImplementingAgency);
    model.interventionRegionList = model.interventionRegionList?.map((x: any) => interventionRegionInterceptor.send(x) as InterventionRegion);
    model.interventionFieldList = model.interventionFieldList?.map((x: any) => interventionFieldInterceptor.send(x) as InterventionField);
    model.bestPracticesList = model.bestPracticesList?.map((x: any) => bestPracticesInterceptor.send(x) as BestPractices);
    model.lessonsLearnedList = model.lessonsLearnedList?.map((x: any) => lessonsLearnedInterceptor.send(x) as LessonsLearned);
    model.officeEvaluationList = model.officeEvaluationList?.map((x: any) => officeEvaluationInterceptor.send(x) as OfficeEvaluation);
    model.resultList = model.resultList?.map((x: any) => resultInterceptor.send(x) as Result);
    model.stageList = model.stageList?.map((x: any) => stageInterceptor.send(x) as Stage);
    UrgentInterventionAnnouncementResultInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<UrgentInterventionAnnouncementResult>): void {
    delete model.ouInfo;
    delete model.beneficiaryCountryInfo;
    delete model.executionCountryInfo;
  }
}
