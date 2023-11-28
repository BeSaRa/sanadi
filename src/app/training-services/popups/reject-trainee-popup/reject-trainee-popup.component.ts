import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { LangService } from '@app/services/lang.service';
import { CustomValidators } from '@app/validators/custom-validators';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { Trainee } from '@app/models/trainee';
import { ToastService } from '@app/services/toast.service';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { TraineeService } from '@app/services/trainee.service';

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
  ids: number[] = [];
  trainingProgramId!: number;
  userClick: typeof UserClickOn = UserClickOn;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<{ ids: number[], trainingProgramId: number, comment: string }>,
    public lang: LangService,
    public fb: UntypedFormBuilder,
    public dialogRef: DialogRef,
    private service: TraineeService,
    public toast: ToastService) {
    this.ids = data.ids;
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
        return this.service.rejectBulk(this.ids.map((id) => {
          return {
            traineeId: id,
            trainingProgramId: this.trainingProgramId,
            refusalComment: this.form.get('comment')?.value
          }
        })
        ).pipe(catchError(_ => of(null)));
      }))
      .subscribe((success) => {
        if (success) {
          const message = this.lang.map.candidates_has_been_rejected;
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
