import {Component, Input, OnInit} from '@angular/core';
import {CommentService} from '../../../services/comment.service';
import {Subject} from 'rxjs';
import {LangService} from '../../../services/lang.service';
import {takeUntil} from 'rxjs/operators';
import {CaseComment} from '../../../models/case-comment';
import {DialogService} from '../../../services/dialog.service';
import {CaseCommentPopupComponent} from '../case-comment-popup/case-comment-popup.component';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {
  _caseId: string = '{93A0A4F9-3649-C709-857B-78F3A1A00000}';
  comments: CaseComment[] = [];
  @Input() service!: CommentService<any>;

  @Input()
  set caseId(value: string) {
    this._caseId = value;
  }

  get caseId(): string {
    return this._caseId;
  }

  // {93A0A4F9-3649-C709-857B-78F3A1A00000}
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
        if (comment) {
          this.loadComments();
        }
      });
  }

  showComment($event: MouseEvent, comment: CaseComment) {
    $event.preventDefault();
    this.dialog.success(comment.text, {hideIcon: true, actionBtn: 'btn_close'});
  }
}
