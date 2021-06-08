import {Component, Inject, OnInit} from '@angular/core';
import {CaseComment} from '../../../models/case-comment';
import {DIALOG_DATA_TOKEN} from '../../tokens/tokens';
import {CommentService} from '../../../services/comment.service';
import {LangService} from '../../../services/lang.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CustomValidators} from '../../../validators/custom-validators';
import {ToastService} from '../../../services/toast.service';
import {DialogRef} from '../../models/dialog-ref';
import {AdminResult} from '../../../models/admin-result';
import {EmployeeService} from '../../../services/employee.service';

@Component({
  selector: 'app-case-comment-popup',
  templateUrl: './case-comment-popup.component.html',
  styleUrls: ['./case-comment-popup.component.scss']
})
export class CaseCommentPopupComponent implements OnInit {
  model?: CaseComment;
  service: CommentService;
  caseId: string;
  form!: FormGroup;

  get comment(): string {
    return this.form.get('text')?.value || '';
  };

  constructor(
    @Inject(DIALOG_DATA_TOKEN) data: { comment: CaseComment, caseId: string, service: CommentService},
    public lang: LangService,
    public fb: FormBuilder,
    private dialogRef: DialogRef,
    private toast: ToastService,
    private employeeService: EmployeeService
  ) {
    this.service = data.service;
    this.caseId = data.caseId;
  }

  ngOnInit(): void {
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
    this.prepareComment();
    this.caseId ? this.saveCommentByApi() : this.saveCommentByClient();
  }

  private prepareComment(): void {
    const employee = this.employeeService.getCurrentUser();
    this.model = (new CaseComment()).clone({
      text: this.comment, creatorInfo: AdminResult.createInstance({
        arName: employee.arName,
        enName: employee.enName
      })
    });
  }

  private saveCommentByApi(): void {
    this.service
      .create(this.caseId, this.model!)
      .subscribe(comment => {
        this.toast.success(this.lang.map.comment_has_been_saved_successfully);
        this.dialogRef.close(comment);
      });
  }

  private saveCommentByClient(): void {
    this.toast.success(this.lang.map.comment_has_been_saved_successfully);
    this.dialogRef.close(this.model);
  }
}
