import {Component, Inject} from '@angular/core';
import {LangService} from "@app/services/lang.service";
import {SurveyQuestion} from "@app/models/survey-question";
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {FormControl} from "@angular/forms";
import {CustomValidators} from "@app/validators/custom-validators";

@Component({
  selector: 'select-question-popup',
  templateUrl: './select-question-popup.component.html',
  styleUrls: ['./select-question-popup.component.scss']
})
export class SelectQuestionPopupComponent {
  questions: SurveyQuestion[] = [];
  selected: number[] = [];
  control: FormControl = new FormControl(null, CustomValidators.required);

  constructor(public lang: LangService,
              private dialogRef: DialogRef,
              @Inject(DIALOG_DATA_TOKEN)
              private data: { questions: SurveyQuestion[], selectedQuestionIds: number[] }) {
    this.questions = this.data.questions;
    this.selected = this.data.selectedQuestionIds;
  }

  selectQuestion() {
    if (!this.control.value) {
      return;
    }
    this.dialogRef.close(this.control.value);
  }

  isQuestionSelectedBefore(q: SurveyQuestion) {
    console.log(q.id, this.selected);
    return this.selected.includes(q.id);
  }
}
