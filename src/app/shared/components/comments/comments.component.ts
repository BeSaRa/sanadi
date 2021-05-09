import {Component, Input, OnInit} from '@angular/core';
import {CommentService} from '../../../services/comment.service';
import {interval, Subject} from 'rxjs';
import {LangService} from '../../../services/lang.service';
import {concatMap, map, takeUntil, tap} from 'rxjs/operators';
import {CaseComment} from '../../../models/case-comment';
import {DialogService} from '../../../services/dialog.service';
import {CaseCommentPopupComponent} from '../case-comment-popup/case-comment-popup.component';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {
  _caseId: string = '';
  comments: CaseComment[] = [];
  @Input() service!: CommentService<any>;

  @Input()
  set caseId(value: string) {
    this._caseId = value;
    if (value) {
      this.addCommentsSilently();
    }
  }

  get caseId(): string {
    return this._caseId;
  }

  private destroy$: Subject<any> = new Subject();

  constructor(public lang: LangService,
              private dialog: DialogService) {
  }

  ngOnInit(): void {
    this.loadComments();
  }

  private loadComments(): void {
    if (!this._caseId) {
      return;
    }
    this.service.load(this._caseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(comments => this.comments = comments);
  }

  openCommentDialog(): void {
    this.dialog.show(CaseCommentPopupComponent, {
      service: this.service,
      caseId: this._caseId
    }).onAfterClose$
      .subscribe((comment) => {
        if (comment && !this.caseId) {
          this.comments = this.comments.concat(comment);
        }
        this.loadComments();
      });
  }

  showComment($event: MouseEvent, comment: CaseComment) {
    $event.preventDefault();
    this.dialog.success(comment.text, {hideIcon: true, actionBtn: 'btn_close'});
  }

  private addCommentsSilently() {
    const comments = this.comments.filter(item => !item.id);
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
          return this.service.create(this.caseId, comment);
        })
      )
      .subscribe({
        complete: () => {
          this.loadComments();
        }
      });
  }
}
