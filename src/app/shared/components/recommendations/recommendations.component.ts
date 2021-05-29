import {Component, Input, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {CaseComment} from '../../../models/case-comment';
import {interval, Subject} from 'rxjs';
import {DialogService} from '../../../services/dialog.service';
import {concatMap, map, takeUntil, tap} from 'rxjs/operators';
import {RecommendationService} from '../../../services/recommendation.service';
import {RecommendationPopupComponent} from '../../popups/recommendation-popup/recommendation-popup.component';

@Component({
  selector: 'app-recommendations',
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.scss']
})
export class RecommendationsComponent implements OnInit {
  _caseId: string = '';
  recommendations: CaseComment[] = [];
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

  private loadRecommendations(): void {
    if (!this._caseId) {
      return;
    }
    this.service.load(this._caseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(comments => this.recommendations = comments);
  }

  openRecommendationDialog(): void {
    this.dialog.show(RecommendationPopupComponent, {
      service: this.service,
      caseId: this._caseId
    }).onAfterClose$
      .subscribe((comment) => {
        if (comment && !this.caseId) {
          this.recommendations = this.recommendations.concat(comment);
        }
        this.loadRecommendations();
      });
  }

  showRecommendation($event: MouseEvent, comment: CaseComment) {
    $event.preventDefault();
    this.dialog.success(comment.text, {hideIcon: true, actionBtn: 'btn_close'});
  }

  private addRecommendationsSilently() {
    const comments = this.recommendations.filter(item => !item.id);
    if (!comments.length || !this.caseId) {
      return;
    }
    const valueDone: Subject<any> = new Subject();
    interval()
      .pipe(
        tap(index => {
          if (!comments[index]) {
            valueDone.next();
            valueDone.complete();
          }
        }),
        takeUntil(valueDone),
        map(index => comments[index]),
        concatMap((comment: CaseComment) => {
          return this.service.create(this._caseId, comment);
        })
      )
      .subscribe({
        complete: () => {
          this.loadRecommendations();
        }
      });
  }
}
