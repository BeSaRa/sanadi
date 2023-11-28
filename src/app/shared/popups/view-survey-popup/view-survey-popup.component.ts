import {Component, Inject} from '@angular/core';
import {LangService} from "@app/services/lang.service";
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {TrainingProgram} from "@app/models/training-program";
import {SurveyTemplate} from "@app/models/survey-template";
import {TraineeData} from "@app/models/trainee-data";
import {ToastService} from "@app/services/toast.service";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {DialogService} from "@app/services/dialog.service";
import {ViewTraineeSurveyComponent} from "@app/shared/popups/view-trainee-survey/view-trainee-survey.component";
import {SurveyService} from "@app/services/survey.service";
import {map} from "rxjs/operators";

@Component({
  selector: 'view-survey-popup',
  templateUrl: './view-survey-popup.component.html',
  styleUrls: ['./view-survey-popup.component.scss']
})
export class ViewSurveyPopupComponent {
  private template: SurveyTemplate;
  program: TrainingProgram;
  displayedColumns: string[] = ['arName', 'enName', 'department', 'status', 'nationality', 'actions'];
  traineeList: TraineeData[] = [];

  constructor(public lang: LangService,
              private toast: ToastService,
              private dialog: DialogService,
              private surveyService: SurveyService,
              private dialogRef: DialogRef,
              @Inject(DIALOG_DATA_TOKEN)
              private data: { program: TrainingProgram, template: SurveyTemplate }) {
    this.template = data.template;
    this.program = data.program;
    this.traineeList = this.program.traineeList.filter((t) => t.isAttended && t.status === 2);
  }

  viewTraineeSurvey(row: TraineeData): void {
    if (!row.surveyURL) {
      this.toast.error(this.lang.map.the_selected_trainee_has_no_survey_to_display);
      return;
    }
    console.log("to vote URL:", row.surveyURL);
    this.surveyService
      .loadSurveyByTraineeIdAndProgramId(row.trainee.id, this.program.id)
      .pipe(map((survey) => this.dialog.show(ViewTraineeSurveyComponent, {
        trainee: row.trainee,
        template: this.template,
        program: this.program,
        survey
      }, {
        fullscreen: true
      })))
      .subscribe()


  }

  printReport(): void {
    this.surveyService
      .printReport(this.program.id)
      .subscribe((blob) => {
        window.open(blob.url);
      });
  }
  exportReportAsWord(): void {
    this.surveyService
      .printReport(this.program.id, 'word')
      .subscribe((blob) => {
        window.open(blob.url);
      });
  }
}
