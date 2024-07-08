import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {BehaviorSubject, interval, Subject} from 'rxjs';
import {DialogService} from '@app/services/dialog.service';
import {concatMap, map, takeUntil, tap} from 'rxjs/operators';
import {RecommendationService} from '@app/services/recommendation.service';
import {RecommendationPopupComponent} from '../../popups/recommendation-popup/recommendation-popup.component';
import {Recommendation} from '@app/models/recommendation';
import {UntypedFormControl} from '@angular/forms';
import {CaseModel} from '@app/models/case-model';
import {AdminResult} from '@app/models/admin-result';
import {EmployeeService} from '@app/services/employee.service';
import {ToastService} from '@app/services/toast.service';
import {CustomValidators} from '@app/validators/custom-validators';

@Component({
  selector: 'app-recommendations',
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.scss']
})
export class RecommendationsComponent implements OnInit, OnDestroy {

  _caseId: string = '';
  recommendations: Recommendation[] = [];
  @Input() service!: RecommendationService;
  @Input() gridStyle: boolean = true;
  @Input()
  case?: CaseModel<any, any>;

  formControl: UntypedFormControl = new UntypedFormControl('');

  _disabled: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  @Input()
  set disabled(val: boolean) {
    this._disabled.next(val);
  };

  get disabled(): boolean {
    return this._disabled.value;
  }

  @Input()
  set caseId(value: string | undefined) {
    this._caseId = value ? value : '';
    if (value) {
      this.addRecommendationsSilently();
    } else {
      this.recommendations = [];
    }
  }

  get caseId(): string | undefined {
    return this._caseId;
  }

  private destroy$: Subject<void> = new Subject();
  customValidators = CustomValidators;

  constructor(public lang: LangService,
              public employeeService: EmployeeService,
              private toast: ToastService,
              private dialog: DialogService) {

  }

  ngOnInit(): void {
    if (this.case) {
      this.formControl.setValue(this.case.recommendation);
    } else {
      this.loadRecommendations();
    }
    this.listenToDisabledState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRecommendations(): void {
    if (!this._caseId) {
      return;
    }
    this.service.load(this._caseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(recommendations => {
        this.recommendations = recommendations.reverse();
        if (this.recommendations.length) {
          this.formControl.setValue(this.recommendations[0].text);
          this.formControl.markAsPristine();
        }
      });
  }

  openRecommendationDialog(): void {
    this.dialog.show(RecommendationPopupComponent, {
      service: this.service,
      caseId: this._caseId
    }).onAfterClose$
      .subscribe((recommendation) => {
        if (recommendation && !this.caseId) {
          this.recommendations = this.recommendations.concat(recommendation);
        }
        this.loadRecommendations();
      });
  }

  showRecommendation($event: MouseEvent, recommendation: Recommendation) {
    $event.preventDefault();
    this.dialog.success(recommendation.text, {hideIcon: true, actionBtn: 'btn_close'});
  }

  private addRecommendationsSilently() {
    const recommendations = this.recommendations.filter(item => !item.id);
    if (!recommendations.length || !this.caseId) {
      return;
    }
    const valueDone: Subject<void> = new Subject();
    interval()
      .pipe(
        tap(index => {
          if (!recommendations[index]) {
            valueDone.next();
            valueDone.complete();
          }
        }),
        takeUntil(valueDone),
        map(index => recommendations[index]),
        concatMap((recommendation: Recommendation) => {
          return this.service.create(this._caseId, recommendation);
        })
      )
      .subscribe({
        complete: () => {
          this.loadRecommendations();
        }
      });
  }

  saveRecommendationChanges() {
    if (!this._caseId) {
      return;
    }

    if (this.disabled) {
      this.dialog.error(this.lang.map.not_allowed_to_do_this_action);
      return;
    }

    const recommendationValue = (this.formControl.value as string).trim();
    if (recommendationValue.length < 4) {
      this.dialog.error(this.lang.map.err_specific_min_length.change({field: this.lang.map.recommendation, length: 4}));
      return;
    }
    const employee = this.employeeService.getCurrentUser();

    const recommendation: Recommendation = (new Recommendation()).clone({
      text: recommendationValue,
      creatorInfo: AdminResult.createInstance({
        arName: employee.arName,
        enName: employee.enName
      })
    });

    this.service
      .create(this._caseId, recommendation)
      .subscribe((recommendation) => {
        this.toast.success(this.lang.map.msg_update_x_success.change({x: this.lang.map.recommendation}));
        this.formControl.setValue(recommendation.text);
        this.formControl.markAsPristine();
      });
  }

  showRecommendationsHistory() {
    this.case?.manageRecommendations(true).onAfterClose$.subscribe(() => {
      this.loadRecommendations();
    });
  }

  private listenToDisabledState() {
    this._disabled.pipe(takeUntil(this.destroy$)).subscribe((val) => val ? this.formControl.disable() : this.formControl.enable());
  }
}
