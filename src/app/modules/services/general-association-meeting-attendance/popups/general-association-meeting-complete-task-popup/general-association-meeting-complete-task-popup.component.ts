import {Component, Inject, OnInit} from '@angular/core';
import {UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {CustomValidators} from '@app/validators/custom-validators';
import {Observable, of, Subject} from 'rxjs';
import {WFResponseType} from '@enums/wfresponse-type.enum';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {BaseGenericEService} from '@app/generics/base-generic-e-service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {ToastService} from '@services/toast.service';
import {LangService} from '@services/lang.service';
import {InboxService} from '@services/inbox.service';
import {IWFResponse} from '@contracts/i-w-f-response';
import {filter, map, switchMap} from 'rxjs/operators';
import {GeneralAssociationMeetingAttendance} from '@models/general-association-meeting-attendance';
import {GeneralAssociationExternalMember} from '@models/general-association-external-member';
import { GeneralAssociationAgenda } from '@app/models/general-association-meeting-agenda';

@Component({
  selector: 'general-association-meeting-complete-task-popup',
  templateUrl: './general-association-meeting-complete-task-popup.component.html',
  styleUrls: ['./general-association-meeting-complete-task-popup.component.scss']
})
export class GeneralAssociationMeetingCompleteTaskPopupComponent implements OnInit {
  comment: UntypedFormControl = new UntypedFormControl('', [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS), CustomValidators.required]);
  done$: Subject<void> = new Subject<void>();
  destroy$: Subject<void> = new Subject();
  customValidators = CustomValidators;
  model!: GeneralAssociationMeetingAttendance;

  private readonly action: WFResponseType;

  constructor(
    @Inject(DIALOG_DATA_TOKEN) private data: {
      model: GeneralAssociationMeetingAttendance,
      actionType: WFResponseType,
      service: BaseGenericEService<any>,
      form: UntypedFormGroup,
      selectedAdministrativeBoardMembers: GeneralAssociationExternalMember[],
      selectedGeneralAssociationMembers: GeneralAssociationExternalMember[],
      agendaItems: GeneralAssociationAgenda[]
    },
    private dialogRef: DialogRef,
    private toast: ToastService,
    public lang: LangService,
    private inboxService: InboxService) {
    this.action = this.data.actionType;
  }

  ngOnInit(): void {
    this.listenToTakeAction();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  proceed(): Observable<boolean> {
    let responseInfo: Partial<IWFResponse> = {
      selectedResponse: this.action,
      comment: this.comment.value ? this.comment.value : undefined
    }, stream$ = of(null);

    return stream$.pipe(
      switchMap(_ => this.updateCase()),
      switchMap(() => this.inboxService.takeActionOnTask(this.data.model.taskDetails.tkiid, responseInfo, this.data.service))
    );
  }

  private listenToTakeAction() {
    this.done$
      .pipe(
        // beforeSave
        switchMap(_ => {
          return of(!!this.comment.value);
        }),
        // emit only if the beforeSave returned true
        filter(value => !!value),
        switchMap(() => this.proceed())
      )
      .subscribe(() => {
        this.toast.success(this.lang.map.process_has_been_done_successfully);
        this.dialogRef.close(true);
      });
  }

  updateCase(): Observable<any> {
    const model = new GeneralAssociationMeetingAttendance().clone({
      ...this.data.model,
      ...this.data.form.get('basicInfo')?.getRawValue(),
      ...this.data.form.get('specialExplanation')?.getRawValue(),
      generalAssociationMembers: this.data.selectedGeneralAssociationMembers,
      administrativeBoardMembers: this.data.selectedAdministrativeBoardMembers,
      agenda: this.data.agendaItems
    });
    return model.update().pipe(map(returned => {
      return returned ? of(true) : of(false);
    }));
  }
}
