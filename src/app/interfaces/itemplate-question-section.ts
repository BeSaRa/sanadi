import { SurveyQuestion } from '@app/models/survey-question';
import { SurveySection } from '@app/models/survey-section';

export interface ITemplateQuestionSection {
  id?: number;
  trainingSurveyTemplateId: number;
  question: Partial<SurveyQuestion>;
  section: Partial<SurveySection>;
  questionOrder: number;
}
