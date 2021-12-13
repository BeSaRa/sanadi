import {Component, OnInit} from '@angular/core';
import {SurveyTemplateService} from "@app/services/survey-template.service";
import {LookupService} from "@app/services/lookup.service";
import {Lookup} from "@app/models/lookup";
import {LangService} from "@app/services/lang.service";

@Component({
  selector: 'survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss']
})
export class SurveyComponent implements OnInit {
  answers: Lookup[] = this.lookupService.listByCategory.TRAINING_SURVEY_ANSWER.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  questionNumber = 1;

  constructor(private surveyTemplateService: SurveyTemplateService,
              private lookupService: LookupService,
              public lang: LangService) {

  }

  ngOnInit(): void {
    this.surveyTemplateService.load()
      .subscribe((list) => console.log(list))
  }

  loaded() {
    console.log('Loaded');
  }
}
