import {Component, Inject, OnInit} from '@angular/core';
import {CaseComment} from '../../../models/case-comment';
import {DIALOG_DATA_TOKEN} from '../../tokens/tokens';
import {CommentService} from '../../../services/comment.service';
import {LangService} from '../../../services/lang.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CustomValidators} from '../../../validators/custom-validators';
import {ToastService} from '../../../services/toast.service';
import {DialogRef} from '../../models/dialog-ref';

@Component({
  selector: 'app-case-comment-popup',
  templateUrl: './case-comment-popup.component.html',
  styleUrls: ['./case-comment-popup.component.scss']
})
export class CaseCommentPopupComponent implements OnInit {
  model?: CaseComment;
  service: CommentService<any>;
  caseId: string;
  form!: FormGroup;

  get comment(): string {
    return this.form.get('text')?.value || '';
  };

  constructor(
    @Inject(DIALOG_DATA_TOKEN) data: { comment: CaseComment, caseId: string, service: CommentService<any> },
    public lang: LangService,
    public fb: FormBuilder,
    private dialogRef: DialogRef,
    private toast: ToastService,
  ) {
    this.service = data.service;
    this.caseId = data.caseId;
  }

  ngOnInit(): void {
    // this.service.create(this.caseId, (new CaseComment()).clone({text: 'Ahmed Mostafa Ibrahem Mohamed Ali'})).subscribe();
    this.buildForm();
  }

  buildForm(): void {
    this.form = this.fb.group({
      text: [null, [CustomValidators.required, CustomValidators.minLength(4)]]
    });
  }

  saveComment(): void {
    if (this.form.invalid) {
      return;
    }
    this.caseId ? this.saveCommentByApi() : this.saveCommentByClient();
  }

  private saveCommentByApi(): void {
    this.service
      .create(this.caseId, (new CaseComment()).clone({text: this.comment}))
      .subscribe(comment => {
        this.toast.success(this.lang.map.comment_has_been_saved_successfully);
        this.dialogRef.close(comment);
      });
  }

  private saveCommentByClient(): void {

  }
}
