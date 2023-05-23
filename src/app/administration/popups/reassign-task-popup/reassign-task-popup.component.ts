import { take, tap } from 'rxjs/operators';
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

@Component({
    selector: 'reassign-task-popup',
    templateUrl: 'reassign-task-popup.component.html',
    styleUrls: ['reassign-task-popup.component.scss']
})
export class ReassignTaskPopupComponent implements OnInit {

  userControl: UntypedFormControl = new UntypedFormControl();
  selectedUser:InternalUser|ExternalUser;
  users:any[]=[];
  constructor(
    public dialogRef: DialogRef,
    @Inject(DIALOG_DATA_TOKEN) data: IDialogData<{user:InternalUser|ExternalUser}>,
    public lang:LangService,
    private commonService:CommonService
  ) {
    this.selectedUser = data.model.user;

  }
  ngOnInit(): void {
    this._loadAllowedUsers()
  }
  save(){
    this.dialogRef.close(this.userControl.value)
  }
  get popupTitle(): string {
    return this.lang.map.reassign_task;
  };

  private _loadAllowedUsers(){
    if(typeof this.selectedUser === typeof ExternalUser){
      this.commonService.loadExternalAssignUsers(this.selectedUser.getProfileId()!)
      .pipe(
        take(1),
        tap(users=>{
          this.users = users
        })
      ).subscribe();
    }
    if(typeof this.selectedUser === typeof InternalUser){
      this.commonService.loadInternalAssignUsers((this.selectedUser as InternalUser).defaultDepartmentId)
      .pipe(
        take(1),
        tap(users=>{
          this.users = users
        })
      ).subscribe();
    }
  }
}
