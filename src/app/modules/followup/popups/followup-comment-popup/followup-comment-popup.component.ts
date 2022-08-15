import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { FollowupComment } from '@app/models/followup-comment';
import { Followup } from '@app/models/followup';
import { LangService } from '@app/services/lang.service';
import { FollowupCommentService } from '@app/services/followup-comment.service';
import { EmployeeService } from '@app/services/employee.service';
import { OrgUser } from '@app/models/org-user';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { InternalUser } from '@app/models/internal-user';

@Component({
  selector: 'followup-comment-popup',
  templateUrl: './followup-comment-popup.component.html',
  styleUrls: ['./followup-comment-popup.component.scss']
})
export class FollowupCommentPopupComponent extends AdminGenericDialog<any> {

  model: FollowupComment = new FollowupComment()
  operation!: OperationTypes;
  comments: FollowupComment[] = [];
  form: UntypedFormGroup = new UntypedFormGroup({});
  user!: OrgUser | InternalUser;
  followUpId!: number;
  @ViewChild('dialogContent', { read: ElementRef })
  dialogContent!: ElementRef<HTMLDivElement>


  constructor(public service: FollowupCommentService,
              public dialogRef: DialogRef,
              public fb: UntypedFormBuilder,
              public lang: LangService,
              public employeeService: EmployeeService,
              @Inject(DIALOG_DATA_TOKEN) private followUp: Followup) {

    super();
    this.followUpId = followUp.id;
    this.user = this.employeeService.getCurrentUser()
  }

  afterSave(model: any, dialogRef: DialogRef): void {
    this.form.controls.comment.setValue('');
    this.form.controls.comment.markAsUntouched();
    this.reloadComments()
  }

  beforeSave(model: any, form: UntypedFormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true))
  }

  destroyPopup(): void {
  }

  initPopup(): void {
    this.reloadComments()
  }

  prepareModel(model: any, form: UntypedFormGroup): any {
    this.model.followUpId = this.followUpId;
    return new FollowupComment().clone({
      ...this.model,
      ...this.form.getRawValue()
    });
  }

  saveFail(error: Error): void {
  }

  isInternal(): boolean {
    return this.employeeService.isInternalUser()
  }

  isCurrentUser(comment: FollowupComment): boolean {
    return comment.generalUseId === this.user?.generalUserId
  }

  reloadComments(): void {
    this.service.getCommentsByFollowupId(this.followUpId)
      .subscribe(res => {
        this.comments = res.sort((a: FollowupComment, b: FollowupComment) =>
          (new Date(a.statusDateModified)).getTime() - (new Date(b.statusDateModified)).getTime()
        );
        this.scrollToEnd()
      })
  }

  scrollToEnd(): void {
    setTimeout(() => {
      this.dialogContent.nativeElement.scrollTo({
        top: this.dialogContent.nativeElement.scrollHeight,
        behavior: 'smooth'
      })
    })
  }

  trackCommentBy(_: number, model: FollowupComment): any {
    return model.id
  }
}
