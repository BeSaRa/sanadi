import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {UrgentInterventionReportResult} from '@app/models/urgent-intervention-report-result';
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

export class UrgentInterventionReportResultInterceptor implements IModelInterceptor<UrgentInterventionReportResult> {
  receive(model: UrgentInterventionReportResult): UrgentInterventionReportResult {
    model.beneficiaryCountryInfo && (model.beneficiaryCountryInfo = AdminResult.createInstance(model.beneficiaryCountryInfo));
    model.executionCountryInfo && (model.executionCountryInfo = AdminResult.createInstance(model.executionCountryInfo));
    model.ouInfo && (model.ouInfo = AdminResult.createInstance(model.ouInfo));
    model.implementingAgencyList = model.implementingAgencyList.map((x: any) => {
      return implementingAgencyInterceptor.receive(x);
    });
    model.interventionRegionList = model.interventionRegionList.map((x: any) => {
      return interventionRegionInterceptor.receive(x);
    });
    model.interventionFieldList = model.interventionFieldList.map((x: any) => {
      return interventionFieldInterceptor.receive(x);
    });
    model.officeEvaluationList = model.officeEvaluationList.map((x: any) => {
      return officeEvaluationInterceptor.receive(x);
    });
    model.resultList = model.resultList.map((x: any) => {
      return resultInterceptor.receive(x);
    });
    model.stageList = model.stageList.map((x: any) => {
      return stageInterceptor.receive(x);
    });
    return model;
  }

  send(model: Partial<UrgentInterventionReportResult>): Partial<UrgentInterventionReportResult> {
    model.implementingAgencyList = model.implementingAgencyList?.map((x: any) => implementingAgencyInterceptor.send(x) as ImplementingAgency);
    model.interventionRegionList = model.interventionRegionList?.map((x: any) => interventionRegionInterceptor.send(x) as InterventionRegion);
    model.interventionFieldList = model.interventionFieldList?.map((x: any) => interventionFieldInterceptor.send(x) as InterventionField);
    model.bestPracticesList = model.bestPracticesList?.map((x: any) => bestPracticesInterceptor.send(x) as BestPractices);
    model.lessonsLearnedList = model.lessonsLearnedList?.map((x: any) => lessonsLearnedInterceptor.send(x) as LessonsLearned);
    model.officeEvaluationList = model.officeEvaluationList?.map((x: any) => officeEvaluationInterceptor.send(x) as OfficeEvaluation);
    model.resultList = model.resultList?.map((x: any) => resultInterceptor.send(x) as Result);
    model.stageList = model.stageList?.map((x: any) => stageInterceptor.send(x) as Stage);
    UrgentInterventionReportResultInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<UrgentInterventionReportResult>): void {
    delete model.ouInfo;
    delete model.beneficiaryCountryInfo;
    delete model.executionCountryInfo;
  }
}
