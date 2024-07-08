import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {LangService} from "@app/services/lang.service";
import {Lookup} from "@app/models/lookup";
import {LookupService} from "@app/services/lookup.service";
import {SurveyTemplate} from "@app/models/survey-template";
import {Survey} from "@app/models/survey";
import {SurveyService} from "@app/services/survey.service";
import {SurveyQuestion} from "@app/models/survey-question";
import {SurveyAnswer} from "@app/models/survey-answer";
import {of, Subject} from "rxjs";
import {map, switchMap, takeUntil, tap} from "rxjs/operators";
import {UntypedFormControl} from "@angular/forms";
import {CustomValidators} from "@app/validators/custom-validators";
import {DialogService} from "@app/services/dialog.service";
import {ToastService} from "@app/services/toast.service";

@Component({
  selector: 'survey-view',
  templateUrl: './survey-view.component.html',
  styleUrls: ['./survey-view.component.scss']
})
export class SurveyViewComponent implements OnInit, OnDestroy {
  answers: Lookup[] = this.lookupService.listByCategory.TRAINING_SURVEY_ANSWER.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  @Input()
  title: string | undefined;
  @Input()
  surveyTemplate!: SurveyTemplate
  @Input()
  programId: number | undefined;
  @Input()
  traineeId!: number | undefined;
  @Input()
  survey!: Survey

  @Input()
  viewOnly: boolean = false;

  @Output()
  afterAnswer: EventEmitter<Survey> = new EventEmitter<Survey>();

  @Input()
  ignoreContainer: boolean = false;
  @Input()
  noShadow: boolean = false;
  @Input()
  closeDialog: boolean = false;

  @Input()
  authToken?: string;

  templateAnswersMap: Map<number, SurveyAnswer> = new Map<number, SurveyAnswer>();
  surveyAnswersMap: Map<number, SurveyAnswer> = new Map<number, SurveyAnswer>();

  private questionsMap: Map<number, SurveyQuestion> = new Map<number, SurveyQuestion>();
  private controlsMap: Map<number, UntypedFormControl> = new Map<number, UntypedFormControl>();
  private destroy$:Subject<void> = new Subject<void>();


  constructor(public lang: LangService,
              private surveyService: SurveyService,
              private dialog: DialogService,
              private toast: ToastService,
              private lookupService: LookupService) {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.buildSurveyForm()
  }

  private buildSurveyForm() {
    if (!this.surveyTemplate) {
      throw Error('Please Provide SurveyTemplate to build the form')
    }
    this.questionsMap = this.surveyTemplate.getQeustionMap();
    this.buildSurveyAnswers();
  }

  private buildSurveyAnswers() {
    if (!this.survey) {
      this.survey = new Survey();
    }
    of(this.surveyTemplate.getAnswersMap())
      .pipe(tap((map) => this.templateAnswersMap = map))
      .pipe(map(_ => this.survey.getAnswersMap()))
      .pipe(map(answersMap => {
        this.templateAnswersMap.forEach((item, q) => {
          const answer = answersMap.get(q);
          answersMap.set(q, answer ? answer : item)
          this.isFreeText(q) ? this.controlsMap.set(q, new UntypedFormControl({
            value: answer ? answer.trainingSurveyAnswerText : '',
            disabled: this.viewOnly
          }, CustomValidators.required)) : null
        })
        return answersMap;
      }))
      .subscribe((result) => {
        this.surveyAnswersMap = result;
        if (!this.viewOnly) {
          this.listenToFreeTextChanges();
        }
      })
  }

  updateAnswer(questionId: number, value: number): void {
    if (this.viewOnly) {
      return;
    }
    const answer = this.getAnswerByQuestionId(questionId);
    answer.trainingSurveyAnswerId = value;
    this.surveyAnswersMap.set(questionId, answer);
  }

  onFreeTextChanged(questionId: number, value: string): void {
    const answer = this.getAnswerByQuestionId(questionId);
    answer.trainingSurveyAnswerText = value;
    this.surveyAnswersMap.set(questionId, answer);
  }

  isAnswerSelected(questionId: number, lookupKey: number): boolean {
    const answer = this.getAnswerByQuestionId(questionId);
    return answer.trainingSurveyAnswerId === lookupKey;
  }

  submitSurveyAnswers(): void {
    const hasUnAnsweredQuestions = Array.from(this.surveyAnswersMap.entries()).some(([questionId, answer]) => this.notAnsweredQuestion(questionId, answer));
    if (hasUnAnsweredQuestions) {
      this.dialog.error(this.lang.map.all_survey_questions_need_to_be_answered);
      return;
    }

    of(this.surveyAnswersMap)
      .pipe(map((map) => Array.from(map.values())))
      .pipe(map((answers) => this.survey.answerSet = answers))
      .pipe(switchMap(_ => this.survey.clone({
        traineeId: this.traineeId,
        trainingProgramId: this.programId,
        trainingSurveyTemplateId: this.surveyTemplate.id
      }).save(this.authToken)))
      .subscribe((newSurvey) => {
        this.toast.success(this.lang.map.msg_survey_answered_saved_successfully);
        this.afterAnswer.emit(newSurvey);
        this.disableFreeTextControls();
      })
  }

  private disableFreeTextControls() {
    this.controlsMap.forEach(control => control.disable());
  }

  private getAnswerByQuestionId(questionId: number): SurveyAnswer {
    return this.surveyAnswersMap.get(questionId)!;
  }

  private isFreeText(questionId: number): boolean {
    return (this.questionsMap.get(questionId)! && this.questionsMap.get(questionId)!.isFreeText);
  }

  private listenToFreeTextChanges() {
    this.controlsMap.forEach((control, questionId) => this.listenToFreetextField(questionId, control))
  }

  private listenToFreetextField(questionId: number, control: UntypedFormControl) {
    control
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => this.onFreeTextChanged(questionId, value))
  }

  getFreeTextControl(questionId: number): UntypedFormControl {
    return this.controlsMap.get(questionId)!;
  }

  private notAnsweredQuestion(questionId: number, answer: SurveyAnswer): boolean {
    return (this.isFreeText(questionId) ? (answer.trainingSurveyAnswerText ?? '').trim().length === 0 : !answer.trainingSurveyAnswerId);
  }
}
