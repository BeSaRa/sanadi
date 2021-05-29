import {Component, Inject, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {DIALOG_DATA_TOKEN} from '../../tokens/tokens';
import {EServiceGenericService} from '../../../generics/e-service-generic-service';
import {InboxService} from '../../../services/inbox.service';
import {WFResponseType} from '../../../enums/wfresponse-type.enum';
import {ILanguageKeys} from '../../../interfaces/i-language-keys';
import {FormControl} from '@angular/forms';
import {DialogRef} from '../../models/dialog-ref';
import {ToastService} from '../../../services/toast.service';
import {IWFResponse} from '../../../interfaces/i-w-f-response';
import {QueryResult} from '../../../models/query-result';
import {of, Subject} from 'rxjs';
import {switchMap} from 'rxjs/operators';

@Component({
  selector: 'action-with-comment-popup',
  templateUrl: './action-with-comment-popup.component.html',
  styleUrls: ['./action-with-comment-popup.component.scss']
})
export class ActionWithCommentPopupComponent implements OnInit {
  label: keyof ILanguageKeys;
  comment: FormControl = new FormControl();
  done$: Subject<any> = new Subject<any>();

  constructor(
    @Inject(DIALOG_DATA_TOKEN) private data: {
      service: EServiceGenericService<any, any>,
      inboxService: InboxService,
      actionType: WFResponseType,
      taskId: string,
      task: QueryResult,
      claimBefore: boolean
    },
    private dialogRef: DialogRef,
    private toast: ToastService,
    public lang: LangService) {
    this.label = ((this.data.actionType + '_task') as unknown as keyof ILanguageKeys);
  }

  ngOnInit(): void {
    this.listenToTakeAction();
  }

  proceed() {
    let responseInfo: Partial<IWFResponse> = {
      selectedResponse: this.data.actionType,
      comment: this.comment.value ? this.comment.value : undefined
    };

    if (this.data.actionType === WFResponseType.COMPLETE) {
      responseInfo = {
        comment: this.comment.value ? this.comment.value : undefined
      };
    }

    this.data
      .inboxService
      .takeActionOnTask(this.data.taskId,
        responseInfo,
        this.data.service)
      .subscribe(() => {
        this.toast.success(this.lang.map.process_has_been_done_successfully);
        this.dialogRef.close();
      });
  }

  private listenToTakeAction() {
    this.done$
      .pipe(
        switchMap(_ => this.data.claimBefore ? this.data.task.claim() : of(null)),
      )
      .subscribe(() => {
        this.proceed();
      });
  }
}
