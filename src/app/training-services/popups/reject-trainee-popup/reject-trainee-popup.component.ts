import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {catchError, switchMap, takeUntil} from 'rxjs/operators';
import {of, Subject} from 'rxjs';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {Trainee} from '@app/models/trainee';
import {ToastService} from '@app/services/toast.service';
import {UserClickOn} from '@app/enums/user-click-on.enum';

@Component({
  selector: 'reject-trainee-popup',
  templateUrl: './reject-trainee-popup.component.html',
  styleUrls: ['./reject-trainee-popup.component.scss']
})
export class RejectTraineePopupComponent implements OnInit, OnDestroy {
  comment?: string;
  form!: UntypedFormGroup;
  rejectCandidate$ = new Subject<any>();
  destroy$: Subject<void> = new Subject();
  model!: Trainee;
  trainingProgramId!: number;
  userClick: typeof UserClickOn = UserClickOn;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<Trainee>,
              public lang: LangService,
              public fb: UntypedFormBuilder,
              public dialogRef: DialogRef,
              public toast: ToastService) {
    this.model = data.model;
    this.comment = data.comment;
    this.trainingProgramId = data.trainingProgramId;
  }

  ngOnInit(): void {
    this.buildForm();
    this.listenToConfirmReject();
  }

  buildForm() {
    this.form = this.fb.group({
      comment: [null, [CustomValidators.required]]
    });
  }

  listenToConfirmReject() {
    this.rejectCandidate$
      .pipe(takeUntil(this.destroy$))
      .pipe(switchMap(() => {
        return this.model.reject(this.trainingProgramId, this.form.get('comment')?.value).pipe(catchError(_ => of(null)));
      }))
      .subscribe((success) => {
        if (success) {
          const message = this.lang.map.candidate_x_has_been_rejected.change({x: this.model.getName()});
          this.toast.success(message);
        }
        this.dialogRef.close(this.userClick.YES);
      });
  }

  get popupTitle(): string {
    return this.lang.map.confirm_reject_candidate;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
