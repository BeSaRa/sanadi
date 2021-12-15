import {Component, Inject, OnInit} from '@angular/core';
import {Trainee} from "@app/models/trainee";
import {SurveyTemplate} from "@app/models/survey-template";
import {TrainingProgram} from "@app/models/training-program";
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {Survey} from "@app/models/survey";
import {LangService} from "@app/services/lang.service";

@Component({
  selector: 'view-trainee-survey',
  templateUrl: './view-trainee-survey.component.html',
  styleUrls: ['./view-trainee-survey.component.scss']
})
export class ViewTraineeSurveyComponent implements OnInit {

  constructor(
    public lang: LangService,
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      trainee: Trainee,
      template: SurveyTemplate,
      program: TrainingProgram,
      survey: Survey
    }
  ) {

  }

  ngOnInit(): void {

  }

}
