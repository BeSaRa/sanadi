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
import {catchError, filter, map, switchMap} from "rxjs/operators";
import {of} from "rxjs";
import {ISurveyInfo} from "@app/interfaces/isurvey-info";

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
  viewOnly: boolean = false;
  authToken?: string

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
    const {token, Authorization}: { token?: string, Authorization?: string } = this.route.snapshot.queryParams
    if (!token || !Authorization) {
      this.dialog.error(this.lang.map.please_provide_valid_survey_url);
      return;
    }
    this.authToken = Authorization;
    this.surveyService
      .loadSurveyInfoByToken(token!, this.authToken)
      .pipe(catchError((_) => {
        return of(null);
      }))
      .pipe(filter<ISurveyInfo | null, ISurveyInfo>((result): result is ISurveyInfo => !!result))
      .pipe(switchMap(result => {
        return this.surveyService.loadSurveyByTraineeIdAndProgramId(result.trainee.id, result.trainingProgram.id, this.authToken)
          .pipe(
            map(survey => {
              return {
                survey,
                surveyTemplate: result.surveyTemplate,
                trainee: result.trainee,
                trainingProgram: result.trainingProgram
              }
            })
          )
      }))
      .subscribe(({survey, surveyTemplate, trainee, trainingProgram}) => {
        this.survey = survey;
        this.trainee = trainee;
        this.trainingProgram = trainingProgram;
        this.surveyTemplate = surveyTemplate;
        this.viewOnly = survey && !!survey.id;
      })
  }

  afterAnswer(_$event: Survey) {
    this.viewOnly = true;
  }
}
