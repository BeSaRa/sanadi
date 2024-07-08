import {Component, Inject, OnInit} from '@angular/core';
import {LangService} from "@app/services/lang.service";
import {SurveyTemplateService} from "@app/services/survey-template.service";
import {SurveyTemplate} from "@app/models/survey-template";
import {SurveyService} from "@app/services/survey.service";
import {delay, map, takeUntil, tap} from "rxjs/operators";
import {UntypedFormControl} from "@angular/forms";
import {ToastService} from "@app/services/toast.service";
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {TrainingProgram} from "@app/models/training-program";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {Subject} from "rxjs";

@Component({
  selector: 'select-program-survey-popup',
  templateUrl: './select-program-survey-popup.component.html',
  styleUrls: ['./select-program-survey-popup.component.scss']
})
export class SelectProgramSurveyPopupComponent implements OnInit {
  templates: SurveyTemplate[] = [];
  control: UntypedFormControl = new UntypedFormControl();
  program!: TrainingProgram;
  selectedTemplate: SurveyTemplate | undefined;
  private destroy$: Subject<void> = new Subject();

  constructor(public lang: LangService,
              private surveyService: SurveyService,
              private toast: ToastService,
              private dialogRef: DialogRef,
              @Inject(DIALOG_DATA_TOKEN)
              private data: { program: TrainingProgram },
              private surveyTemplateService: SurveyTemplateService) {

    this.program = this.data.program;
  }

  ngOnInit(): void {
    this.loadTemplates();
    this.listenToTemplateChange();
  }

  loadTemplates(): void {
    this.surveyTemplateService.load()
      .pipe(map(result => {
        return result.filter(template => template.status)
      }))
      .subscribe((templates) => this.templates = templates);
  }

  publishSurvey() {
    if (!this.control.value) {
      this.toast.error(this.lang.map.please_select_survey_template_to_publish)
    }

    this.surveyService
      .publishSurvey(this.data.program.id, this.control.value.id)
      .subscribe(() => {
        this.toast.success(this.lang.map.the_survey_has_been_successfully_published)
        this.dialogRef.close();
      });

  }

  private listenToTemplateChange() {
    this.control
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(_ => this.selectedTemplate = undefined))
      .pipe(delay(100))
      .subscribe((value) => {
        this.selectedTemplate = value;
      })
  }
}
