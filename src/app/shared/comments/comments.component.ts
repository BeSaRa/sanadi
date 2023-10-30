import {Component, Input, OnInit} from '@angular/core';
import {CommentService} from '@app/services/comment.service';
import {interval, Subject} from 'rxjs';
import {LangService} from '@app/services/lang.service';
import {concatMap, map, takeUntil, tap} from 'rxjs/operators';
import {CaseComment} from '@app/models/case-comment';
import {DialogService} from '@app/services/dialog.service';
import {CaseCommentPopupComponent} from '../popups/case-comment-popup/case-comment-popup.component';
import {EmployeeService} from '@app/services/employee.service';
import {CommentHistoryPopupComponent} from '../popups/comment-history-popup/comment-history-popup.component';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {
  _caseId: string = '';
  comments: CaseComment[] = [];
  @Input() service!: CommentService;
  @Input() readonly: boolean = false;

  @Input()
  set caseId(value: string | undefined) {
    this._caseId = value ? value : '';
    if (value) {
      this.addCommentsSilently();
    } else {
      this.comments = [];
    }
  }

  get caseId(): string | undefined {
    return this._caseId;
  }

  private destroy$: Subject<any> = new Subject();

  constructor(public lang: LangService,
              private employeeService: EmployeeService,
              private dialog: DialogService) {
  }

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    if (!this._caseId) {
      return;
    }
    this.service.load(this._caseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(comments => this.comments = comments);
  }

  openCommentDialog(): void {
    if (!this.caseId) {
      this.dialog.info(this.lang.map.this_action_cannot_be_performed_before_saving_the_request);
      return;
    }
    this.dialog.show(CaseCommentPopupComponent, {
      service: this.service,
      caseId: this._caseId,
      editMode: false
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
          return this.service.create(this._caseId, comment);
        })
      )
      .subscribe({
        complete: () => {
          this.loadComments();
        }
      });
  }

  isMyComment(comment: CaseComment) {
    return comment.creatorInfo.id === this.employeeService.getCurrentUser().generalUserId;
  }

  openCommentEditDialog(comment: CaseComment) {
    if (!this.caseId) {
      this.dialog.info(this.lang.map.this_action_cannot_be_performed_before_saving_the_request);
      return;
    }
    this.dialog.show(CaseCommentPopupComponent, {
      service: this.service,
      caseId: this._caseId,
      editMode: true,
      comment
    }).onAfterClose$
      .subscribe((comment) => {
        if (comment && !this.caseId) {
          this.comments = this.comments.concat(comment);
        }
        this.loadComments();
      });
  }

  openCommentHistory(comment: CaseComment) {
    this.dialog.show(CommentHistoryPopupComponent, {
      comment
    });
  }
}
