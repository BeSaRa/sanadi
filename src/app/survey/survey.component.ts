import {Component, OnInit} from '@angular/core';
import {SurveyTemplateService} from "@app/services/survey-template.service";
import {LangService} from "@app/services/lang.service";
import {SurveyService} from "@app/services/survey.service";
import {ActivatedRoute} from "@angular/router";
import {DialogService} from "@app/services/dialog.service";
import {SurveyTemplate} from "@app/models/survey-template";
import {TrainingProgram} from "@app/models/training-program";
import {Survey} from "@app/models/survey";
import {Trainee} from "@app/models/trainee";
import {map, switchMap} from "rxjs/operators";

@Component({
  selector: 'survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss']
})
export class SurveyComponent implements OnInit {
  questionNumber = 1;
  survey!: Survey;
  surveyTemplate: SurveyTemplate | undefined;
  trainingProgram: TrainingProgram | undefined;
  trainee: Trainee | undefined;


  constructor(private surveyTemplateService: SurveyTemplateService,
              private route: ActivatedRoute,
              private dialog: DialogService,
              private surveyService: SurveyService,
              public lang: LangService) {

  }

  ngOnInit(): void {
    this.loadSurvey();
  }


  private loadSurvey(): void {
    const {token}: { token?: string } = this.route.snapshot.queryParams
    if (!token) {
      this.dialog.error(this.lang.map.please_provide_valid_survey_url);
      return;
    }

    this.surveyService
      .loadSurveyInfoByToken(token!)
      .pipe(switchMap(result => {
        return this.surveyService.loadSurveyByTraineeIdAndProgramId(result.trainee.id, result.trainingProgram.id).pipe(map(survey => {
          return {
            survey,
            surveyTemplate: result.surveyTemplate,
            trainee: result.trainee,
            trainingProgram: result.trainingProgram
          }
        }))
      }))
      .subscribe(({survey, surveyTemplate, trainee, trainingProgram}) => {
        this.survey = survey;
        this.trainee = trainee;
        this.trainingProgram = trainingProgram;
        this.surveyTemplate = surveyTemplate;
      })
  }
}
