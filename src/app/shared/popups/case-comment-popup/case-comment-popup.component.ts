import {Component, Inject, OnInit} from '@angular/core';
import {CaseComment} from '@app/models/case-comment';
import {DIALOG_DATA_TOKEN} from '../../tokens/tokens';
import {CommentService} from '@app/services/comment.service';
import {LangService} from '@app/services/lang.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CustomValidators} from '@app/validators/custom-validators';
import {ToastService} from '@app/services/toast.service';
import {DialogRef} from '../../models/dialog-ref';
import {AdminResult} from '@app/models/admin-result';
import {EmployeeService} from '@app/services/employee.service';
import {take} from 'rxjs/operators';

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
  editMode: boolean = false;
  customValidators = CustomValidators;

  get comment(): string {
    return this.form.get('text')?.value || '';
  };

  constructor(
    @Inject(DIALOG_DATA_TOKEN) data: {
      comment: CaseComment,
      caseId: string,
      service: CommentService,
      editMode: boolean,
    },
    public lang: LangService,
    public fb: FormBuilder,
    private dialogRef: DialogRef,
    private toast: ToastService,
    private employeeService: EmployeeService
  ) {
    this.service = data.service;
    this.caseId = data.caseId;

    if (data.editMode && data.comment) {
      this.model = data.comment;
      this.editMode = data.editMode;
    }
  }

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm(): void {
    this.form = this.fb.group({
      text: [this.model ? this.model.text : null, [CustomValidators.required, CustomValidators.minLength(4)]]
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
      ...this.model,
      text: this.comment,
      creatorInfo: AdminResult.createInstance({
        arName: employee.arName,
        enName: employee.enName
      })
    });
  }

  private saveCommentByApi(): void {
    const save$ = this.editMode ? this.service.update(this.caseId, this.model!) : this.service.create(this.caseId, this.model!);
    save$.pipe(take(1)).subscribe(comment => {
      this.toast.success(this.lang.map.comment_has_been_saved_successfully);
      this.dialogRef.close(comment);
    });
  }

  private saveCommentByClient(): void {
    this.toast.success(this.lang.map.comment_has_been_saved_successfully);
    this.dialogRef.close(this.model);
  }
}
