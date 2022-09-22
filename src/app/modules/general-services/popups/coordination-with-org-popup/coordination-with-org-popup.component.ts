import {Component, Inject, OnInit} from '@angular/core';
import {AbstractControl, FormControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {CustomValidators} from '@app/validators/custom-validators';
import {WFResponseType} from '@app/enums/wfresponse-type.enum';
import {of, Subject} from 'rxjs';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {LangService} from '@services/lang.service';
import {DialogService} from '@services/dialog.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {ToastService} from '@services/toast.service';
import {InboxService} from '@services/inbox.service';
import {exhaustMap, filter, switchMap, takeUntil, tap} from 'rxjs/operators';
import {IWFResponse} from '@contracts/i-w-f-response';
import {CoordinationWithOrganizationsRequest} from '@app/models/coordination-with-organizations-request';

@Component({
  selector: 'coordination-with-org-popup',
  templateUrl: './coordination-with-org-popup.component.html',
  styleUrls: ['./coordination-with-org-popup.component.scss']
})
export class CoordinationWithOrgPopupComponent implements OnInit {

  comment: UntypedFormControl = new UntypedFormControl('',
    [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);
  response: WFResponseType = WFResponseType.APPROVE;
  action$: Subject<any> = new Subject<any>();
  approvalForm!: UntypedFormGroup;

  private destroy$: Subject<any> = new Subject();
  constructor(
    @Inject(DIALOG_DATA_TOKEN) public data: {
      model: CoordinationWithOrganizationsRequest,
      action: WFResponseType
    },
    public lang: LangService,
    private dialog: DialogService,
    private dialogRef: DialogRef,
    private toast: ToastService,
    private inboxService: InboxService,
    private fb: UntypedFormBuilder
  ) {
    this.response = this.data.action;
    this.approvalForm = this.fb.group({
      customTerms:this.fb.control(''),
      publicTerms:this.fb.control(''),

  })
  }

  ngOnInit() {
    this._listenToAction();

  }

  private _listenToAction() {
    this.action$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(invalid => invalid && this.dialog.error(this.lang.map.msg_all_required_fields_are_filled)))
      .pipe(filter(invalid => !invalid))
      .pipe(exhaustMap(_ => {

         this.data.model.save()
        return of(true)
      }))
      .pipe(switchMap(_ => this.inboxService.takeActionOnTask(this.data.model.taskDetails.tkiid, this.getResponse(),
        this.data.model.service)))
      .subscribe(() => {
        this.toast.success(this.lang.map.process_has_been_done_successfully);
        this.dialogRef.close(true);
      })
  }

  private getResponse(): Partial<IWFResponse> {
    return this.comment.value ? {
      selectedResponse: this.response,
      comment: this.comment.value
    } : { selectedResponse: this.response };
  }



  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }


}
