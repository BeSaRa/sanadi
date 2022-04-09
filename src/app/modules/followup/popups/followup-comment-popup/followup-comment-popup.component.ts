import { Component } from '@angular/core';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {FollowupComment} from '@app/models/followup-comment';
import {Followup} from '@app/models/followup';
import {LangService} from '@app/services/lang.service';
import {FollowupCommentService} from '@app/services/followup-comment.service';

@Component({
  selector: 'followup-comment-popup',
  templateUrl: './followup-comment-popup.component.html',
  styleUrls: ['./followup-comment-popup.component.scss']
})
export class FollowupCommentPopupComponent extends AdminGenericDialog<any> {

  model!: Followup;
  operation!: OperationTypes;
  comments: FollowupComment[] =[];
  form: FormGroup = new FormGroup({});

  constructor(public service: FollowupCommentService, public dialogRef: DialogRef, public fb: FormBuilder,public lang: LangService) {
    super();
  }
  afterSave(model: any, dialogRef: DialogRef): void {
  }

  beforeSave(model: any, form: FormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  buildForm(): void {
  }

  destroyPopup(): void {
  }

  initPopup(): void {
  }

  prepareModel(model: any, form: FormGroup): any {
  }

  saveFail(error: Error): void {
  }


}
