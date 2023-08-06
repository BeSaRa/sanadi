import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { InboxService } from '@app/services/inbox.service';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { QueryResult } from '@app/models/query-result';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { ToastService } from '@app/services/toast.service';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { of, Subject } from 'rxjs';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { CustomValidators } from '@app/validators/custom-validators';
import { filter, switchMap, take, takeUntil } from 'rxjs/operators';
import { CaseModel } from '@app/models/case-model';
import { BaseGenericEService } from "@app/generics/base-generic-e-service";

@Component({
  selector: 'send-to-single',
  templateUrl: './send-to-single.component.html',
  styleUrls: ['./send-to-single.component.scss']
})
export class SendToSingleComponent implements OnInit, OnDestroy {
  constructor(
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      inboxService: InboxService,
      taskId: string,
      sendToResponse: WFResponseType,
      service: BaseGenericEService<any>,
      claimBefore: boolean,
      task: QueryResult | CaseModel<any, any>,
      extraInfo: any
    },
    private dialogRef: DialogRef,
    private toast: ToastService,
    private fb: UntypedFormBuilder,
    private dialog: DialogService,
    public lang: LangService,
  ) {
  }

  form!: UntypedFormGroup;
  done$: Subject<any> = new Subject<any>();
  private destroy$: Subject<any> = new Subject<any>();
  title: keyof ILanguageKeys = 'send_to_department';


  ngOnInit(): void {
    this.buildForm();
    this.listenToSave();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm(): void {
    let taskName: string = this.data.sendToResponse;
    if (taskName.startsWith('ask:')) {
      taskName = taskName.split('ask:')[1];
    } else if (taskName.startsWith('askSingle:')) {
      taskName = taskName.split('askSingle:')[1];
    }

    this.form = this.fb.group({
      taskName: [taskName, CustomValidators.required],
      comment: ['']
    });
  }

  get taskNameControl(): AbstractControl {
    return this.form.get('taskName') as AbstractControl;
  }

  isValidForm(): boolean {
    let isValid: boolean = !!(this.taskNameControl && this.taskNameControl.value);
    if (!isValid) {
      return false;
    }
    return isValid;
  }

  private listenToSave() {
    const send$ = this.done$.pipe(takeUntil(this.destroy$));
    // when form fail
    send$.pipe(filter(_ => !this.isValidForm()))
      .subscribe(() => {
        this.form.markAllAsTouched();
        this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
      });
    // if form success
    send$
      .pipe(filter(_ => this.isValidForm()))
      .pipe(switchMap(_ => this.data.claimBefore ? this.data.task.claim() : of(null)))
      .subscribe(() => this.send());
  }


  private send(): void {
    let data = this.form.value;

    this.data.inboxService.sendTaskToMultiple(this.data.task.getCaseId(), data, this.data.service)
      .pipe(take(1))
      .subscribe(() => {
        this.toast.success(this.lang.map.sent_successfully);
        this.dialogRef.close(true);
      });
  }
}
