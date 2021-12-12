import {SurveyQuestion} from '@app/models/survey-question';

export interface IQuestionSection {
  id?: number;
  questionOrder?: number;
  question: SurveyQuestion;
}
