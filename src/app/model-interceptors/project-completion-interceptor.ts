import { DateUtils } from '@app/helpers/date-utils';
import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import { AdminResult } from '@app/models/admin-result';
import { BestPractices } from '@app/models/best-practices';
import { LessonsLearned } from '@app/models/lessons-learned';
import { ProjectCompletion } from '@app/models/project-completion';
import { IMyDateModel } from 'angular-mydatepicker';
import { BestPracticesInterceptor } from './best-practices-interceptor';
import { LessonsLearnedInterceptor } from './lessons-learned-interceptor';

const bestPracticesInterceptor: IModelInterceptor<BestPractices> = new BestPracticesInterceptor();
const lessonsLearnedInterceptor: IModelInterceptor<LessonsLearned> = new LessonsLearnedInterceptor();
export class ProjectCompletionInterceptor implements IModelInterceptor<ProjectCompletion> {
  send(model: Partial<ProjectCompletion>): Partial<ProjectCompletion> {
    model.followUpDate && (model.followUpDate = DateUtils.changeDateFromDatepicker(model.followUpDate as unknown as IMyDateModel)?.toISOString());
    model.projectEvaluationSLADate && (model.projectEvaluationSLADate = DateUtils.changeDateFromDatepicker(model.projectEvaluationSLADate as unknown as IMyDateModel)?.toISOString());
    model.licenseEndDate && (model.licenseEndDate = DateUtils.changeDateFromDatepicker(model.licenseEndDate as unknown as IMyDateModel)?.toISOString());
    model.actualEndDate && (model.actualEndDate = DateUtils.changeDateFromDatepicker(model.actualEndDate as unknown as IMyDateModel)?.toISOString());


    delete model.domainInfo;
    delete model.workAreaInfo;
    delete model.mainDACCategoryInfo;
    delete model.subDACCategoryInfo;
    delete model.mainUNOCHACategoryInfo;
    delete model.subUNOCHACategoryInfo;
    delete model.internalProjectClassificationInfo;
    delete model.beneficiaryCountryInfo;
    delete model.searchFields;

    if (model.bestPracticesList && model.bestPracticesList.length > 0) {
      model.bestPracticesList = model.bestPracticesList.map(x => bestPracticesInterceptor.send(x) as BestPractices);
    }
    if (model.lessonsLearnedList && model.lessonsLearnedList.length > 0) {
      model.lessonsLearnedList = model.lessonsLearnedList.map(x => lessonsLearnedInterceptor.send(x) as LessonsLearned);
    }

    return model;
  }

  receive(model: ProjectCompletion): ProjectCompletion {
    model.followUpDate = DateUtils.changeDateToDatepicker(model.followUpDate);
    model.projectEvaluationSLADate = DateUtils.changeDateToDatepicker(model.projectEvaluationSLADate);
    model.licenseEndDate = DateUtils.changeDateToDatepicker(model.licenseEndDate);
    model.actualEndDate = DateUtils.changeDateToDatepicker(model.actualEndDate);
    model.domainInfo = AdminResult.createInstance(model.domainInfo);
    model.workAreaInfo = AdminResult.createInstance(model.workAreaInfo);
    model.mainDACCategoryInfo = AdminResult.createInstance(model.mainDACCategoryInfo);
    model.subDACCategoryInfo = AdminResult.createInstance(model.subDACCategoryInfo);
    model.mainUNOCHACategoryInfo = AdminResult.createInstance(model.mainUNOCHACategoryInfo);
    model.subUNOCHACategoryInfo = AdminResult.createInstance(model.subUNOCHACategoryInfo);
    model.internalProjectClassificationInfo = AdminResult.createInstance(model.internalProjectClassificationInfo);
    model.beneficiaryCountryInfo = AdminResult.createInstance(model.beneficiaryCountryInfo);

    if (model.bestPracticesList && model.bestPracticesList.length > 0) {
      model.bestPracticesList = model.bestPracticesList.map(x => bestPracticesInterceptor.receive(new BestPractices().clone(x)));
    }
    if (model.lessonsLearnedList && model.lessonsLearnedList.length > 0) {
      model.lessonsLearnedList = model.lessonsLearnedList.map(x => lessonsLearnedInterceptor.receive(new LessonsLearned().clone(x)));
    }
    return model;
  }
}
