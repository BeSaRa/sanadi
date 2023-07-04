import { take, tap, catchError } from 'rxjs/operators';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { ExternalUser } from '@app/models/external-user';
import { InternalUser } from '@app/models/internal-user';
import { Profile } from '@app/models/profile';
import { CommonService } from '@app/services/common.service';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { QueryResult } from '@app/models/query-result';
import { of } from 'rxjs';
import { UserTypes } from '@app/enums/user-types.enum';

@Component({
  selector: 'reassign-task-popup',
  templateUrl: 'reassign-task-popup.component.html',
  styleUrls: ['reassign-task-popup.component.scss']
})
export class ReassignTaskPopupComponent implements OnInit {

  userControl: UntypedFormControl = new UntypedFormControl();
  selectedUser: InternalUser | ExternalUser;
  selectedTasks:QueryResult[]=[];
  users: any[] = [];
  queryId!:number;
  constructor(
    public dialogRef: DialogRef,
    @Inject(DIALOG_DATA_TOKEN) data: IDialogData<{
       user: InternalUser | ExternalUser,
       tasks:QueryResult[],
       queryId:number
       }>,
    public lang: LangService,
    private commonService: CommonService
  ) {
    this.selectedUser = data.model.user;
    this.selectedTasks = data.model.tasks;
    this.queryId = data.model.queryId;

  }
  ngOnInit(): void {
    this._loadAllowedUsers()
  }
  save() {
    this.dialogRef.close(this.userControl.value)
  }
  get popupTitle(): string {
    return this.lang.map.reassign_task;
  };

  private _loadAllowedUsers() {
    if (this.selectedUser.userType === UserTypes.EXTERNAL) {
      this.commonService.loadExternalAssignUsers(this.queryId,this.selectedTasks)
        .pipe(
          take(1),
          tap(users => {
            this.users = users
          }),
          catchError(_=>{
            this.dialogRef.close();
            return of(null);
          })
        ).subscribe();
    }
    if (this.selectedUser.userType === UserTypes.INTERNAL) {
      this.commonService.loadInternalAssignUsers(this.queryId, this.selectedTasks)
        .pipe(
          take(1),
          tap(users => {
            this.users = users
          }),
          catchError(_=>{
            this.dialogRef.close();
            return of(null);
          })
        ).subscribe();
    }
  }
}
