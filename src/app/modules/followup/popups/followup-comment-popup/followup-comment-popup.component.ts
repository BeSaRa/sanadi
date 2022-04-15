import {Component, Inject} from '@angular/core';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {FollowupComment} from '@app/models/followup-comment';
import {Followup} from '@app/models/followup';
import {LangService} from '@app/services/lang.service';
import {FollowupCommentService} from '@app/services/followup-comment.service';
import {EmployeeService} from '@app/services/employee.service';
import {OrgUser} from '@app/models/org-user';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {InternalUser} from '@app/models/internal-user';

@Component({
  selector: 'followup-comment-popup',
  templateUrl: './followup-comment-popup.component.html',
  styleUrls: ['./followup-comment-popup.component.scss']
})
export class FollowupCommentPopupComponent extends AdminGenericDialog<any> {

  model: FollowupComment = new FollowupComment()
  operation!: OperationTypes;
  comments: FollowupComment[] =[];
  form: FormGroup = new FormGroup({});
  user!: OrgUser | InternalUser | undefined;
  followUpId!: number;

  constructor(public service: FollowupCommentService,
              public dialogRef: DialogRef,
              public fb: FormBuilder,
              public lang: LangService,
              public employeeService: EmployeeService,
              @Inject(DIALOG_DATA_TOKEN) private  followUp: Followup) {

    super();
    this.followUpId = followUp.id;
  }
  afterSave(model: any, dialogRef: DialogRef): void {
    this.initPopup();
    this.form.controls.comment.setValue('');
    this.form.controls.comment.markAsUntouched();
  }

  beforeSave(model: any, form: FormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true))
  }

  destroyPopup(): void {
  }

  initPopup(): void {
    this.service.getCommentsByFollowupId(this.followUpId).subscribe( res => {
      this.comments = res;
    })

    this.user = this.employeeService.isExternalUser()? this.employeeService.getUser(): this.employeeService.getInternalUser();

  }

  prepareModel(model: any, form: FormGroup): any {
    this.model.followUpId = this.followUpId;
    const newModel = new FollowupComment().clone({
      ...this.model,
      ...this.form.getRawValue()
    });
    return newModel;
  }

  saveFail(error: Error): void {
  }


}
