import {SurveyTemplate} from "@app/models/survey-template";
import {Trainee} from "@app/models/trainee";
import {TrainingProgram} from "@app/models/training-program";

export interface ISurveyInfo {
  surveyTemplate: SurveyTemplate;
  trainee: Trainee;
  trainingProgram: TrainingProgram;
}
