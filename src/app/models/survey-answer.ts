import {Cloneable} from "@app/models/cloneable";

export class SurveyAnswer extends Cloneable<SurveyAnswer>{
  id!: number;
  trainingSurveyQuestionId!: number;
  trainingSurveySectionId!: number;
  trainingSurveyId!: number;
  trainingSurveyAnswerId!: number;
  trainingSurveyAnswerText!: string;
}
