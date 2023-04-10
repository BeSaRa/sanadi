import { Component, Inject, OnInit } from '@angular/core';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { TrainingProgram } from '@app/models/training-program';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { Trainee } from '@app/models/trainee';
import { LangService } from '@app/services/lang.service';
import { DialogService } from '@app/services/dialog.service';
import { ToastService } from '@app/services/toast.service';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { catchError, exhaustMap, filter, switchMap, takeUntil } from 'rxjs/operators';
import { TraineeService } from '@app/services/trainee.service';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { TraineeData } from '@app/models/trainee-data';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { CandidatesListTypeEnum } from '@app/enums/candidates-list-type.enum';
import { CertificateService } from '@app/services/certificate.service';
import { TraineeStatus } from '@app/enums/trainee-status';
import { EmployeeService } from '@app/services/employee.service';

@Component({
  selector: 'training-program-candidates',
  templateUrl: './training-program-candidates-popup.component.html',
  styleUrls: ['./training-program-candidates-popup.component.scss']
})
export class TrainingProgramCandidatesPopupComponent implements OnInit {
  reload$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  add$: Subject<any> = new Subject<any>();
  reviewCandidate$: Subject<number> = new Subject<number>();
  destroy$: Subject<any> = new Subject<any>();
  searchText = '';
  actions: IMenuItem<TrainingProgram>[] = [
    {
      type: 'action',
      label: 'btn_reload',
      icon: 'mdi-reload',
      onClick: _ => this.reload$.next(null),
    }
  ];
  displayedColumns: string[] = ['arName', 'enName', 'department', 'status', 'nationality', 'actions'];
  edit$: Subject<Trainee> = new Subject<Trainee>();
  models: Trainee[] = [];
  trainingProgramId: number;
  operation!: OperationTypes;
  candidatesListType!: number;
  candidatesListTypeEnum = CandidatesListTypeEnum;
  traineeStatusEnum = TraineeStatus;
  isInternalUser!: boolean;
  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<number>,
    public lang: LangService,
    public service: TraineeService,
    private dialogService: DialogService,
    private toast: ToastService,
    private certificateService: CertificateService,
    private employeeService: EmployeeService) {
    this.operation = data.operation;
    this.trainingProgramId = data.model;
    this.candidatesListType = data.candidatesListType;
  }

  ngOnInit(): void {
    this.isInternalUser = this.employeeService.isInternalUser();
    this.listenToAdd();
    this.listenToEdit();
    this.listenToReload();
    this.listenToReviewCandidate();
  }

  listenToAdd() {
    this.add$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap(() => this.service.openAddTrainingProgramCandidateDialog(this.trainingProgramId).onAfterClose$))
      .subscribe(() => {
        this.reload$.next(this.trainingProgramId);
      });
  }

  listenToEdit(): void {
    this.edit$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((trainee) => this.service.openEditTrainingProgramCandidateDialog(this.trainingProgramId, trainee).onAfterClose$))
      .subscribe(() => {
        this.reload$.next(this.trainingProgramId);
      });
  }

  edit(traineeData: TraineeData, event: MouseEvent) {
    event.preventDefault();
    this.edit$.next(traineeData.trainee);
  }

  reviewCandidate(event: MouseEvent, model: TraineeData) {
    event.preventDefault();
    this.reviewCandidate$.next(model.trainee.id);
  }

  listenToReviewCandidate(): void {
    this.reviewCandidate$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((traineeId) => {
        return this.service.openEvaluateTrainingProgramCandidateDialog(this.trainingProgramId, traineeId).pipe(catchError(_ => of(null)));
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null));
  }

  listenToReload() {
    this.reload$
      .pipe(takeUntil((this.destroy$)))
      .pipe(switchMap(() => {
        let load = this.service.trainingProgramCandidates(this.trainingProgramId);
        return load.pipe(catchError(_ => of([])));
      }))
      .subscribe((list: Trainee[]) => {
        this.models = list;
      });
  }

  downloadCertificate(event: MouseEvent, model: TraineeData) {
    event.preventDefault();
    return this.certificateService.downloadCertificate(this.trainingProgramId, model.trainee.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        let downloadURL = window.URL.createObjectURL(data.blob);
        window.open(downloadURL);
      });
  }

  showRejectionReason(event: MouseEvent, model: TraineeData) {
    event.preventDefault();
    this.dialogService.info(model.refusalComment);
  }

  searchCallback = (record: any, searchText: string) => {
    return record.trainee.search(searchText);
  };

  get popupTitle(): string {
    return this.candidatesListType == this.candidatesListTypeEnum.CERTIFY ? this.lang.map.training_program_trainees : this.lang.map.training_program_candidates;
  };

  delete(event: MouseEvent, model: TraineeData): void {
    event.preventDefault();
    const traineeModel = (new Trainee()).clone(model.trainee);
    // @ts-ignore
    const message = this.lang.map.msg_confirm_delete_x.change({ x: model.trainee.getName() });
    this.dialogService.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const sub = traineeModel.deleteTrainee(this.trainingProgramId).subscribe(() => {
            // @ts-ignore
            this.toast.success(this.lang.map.msg_delete_x_success.change({ x: model.trainee.getName() }));
            this.reload$.next(null);
            sub.unsubscribe();
          });
        }
      });
  }

  showDeleteButton(row: TraineeData) {
    return (this.employeeService.isLicensingUser() && this.candidatesListType == this.candidatesListTypeEnum.ADD) || (
      !this.isInternalUser && row.status != this.traineeStatusEnum.ACCEPTED_TRAINEE &&
      !row.addedByRACA &&
      row.trainee.isDraft)
  }

  showEditButton(row: TraineeData) {
    return (this.employeeService.isLicensingUser() && this.candidatesListType == this.candidatesListTypeEnum.ADD) || (
      !this.isInternalUser && row.status != this.traineeStatusEnum.ACCEPTED_TRAINEE &&
      !row.addedByRACA &&
      row.trainee.isDraft)
  }
}
