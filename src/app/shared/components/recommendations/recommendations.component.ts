import {Component, Input, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {interval, Subject} from 'rxjs';
import {DialogService} from '../../../services/dialog.service';
import {concatMap, map, takeUntil, tap} from 'rxjs/operators';
import {RecommendationService} from '../../../services/recommendation.service';
import {RecommendationPopupComponent} from '../../popups/recommendation-popup/recommendation-popup.component';
import {Recommendation} from '../../../models/recommendation';

@Component({
  selector: 'app-recommendations',
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.scss']
})
export class RecommendationsComponent implements OnInit {
  _caseId: string = '';
  recommendations: Recommendation[] = [];
  @Input() service!: RecommendationService<any>;

  @Input()
  set caseId(value: string | undefined) {
    this._caseId = value ? value : '';
    if (value) {
      this.addRecommendationsSilently();
    }
  }

  get caseId(): string | undefined {
    return this._caseId;
  }

  private destroy$: Subject<any> = new Subject();

  constructor(public lang: LangService,
              private dialog: DialogService) {
  }

  ngOnInit(): void {
    this.loadRecommendations();
  }

  loadRecommendations(): void {
    if (!this._caseId) {
      return;
    }
    this.service.load(this._caseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(recommendations => this.recommendations = recommendations.reverse());
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
    const valueDone: Subject<any> = new Subject();
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
}
