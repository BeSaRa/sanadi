import {BaseModel} from "@app/models/base-model";
import {SurveyService} from "@app/services/survey.service";
import {FactoryService} from "@app/services/factory.service";
import {SurveyAnswer} from "@app/models/survey-answer";

export class Survey extends BaseModel<Survey, SurveyService> {
  service: SurveyService;
  trainingProgramId!: number;
  traineeId!: number;
  trainingSurveyTemplateId!: number;
  answerSet: SurveyAnswer[] = [];
  actionTime: Date = new Date();

  constructor() {
    super();
    this.service = FactoryService.getService('SurveyService');
  }

  getAnswersMap(): Map<number, SurveyAnswer> {
    const map = new Map<number, SurveyAnswer>();
    this.answerSet.forEach((answer) => map.set(answer.trainingSurveyQuestionId, answer));
    return map
  }
}
