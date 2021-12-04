import {Component, Inject, OnInit} from '@angular/core';
import {TrainingProgram} from '@app/models/training-program';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {LangService} from '@app/services/lang.service';
import {ToastService} from '@app/services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DialogService} from '@app/services/dialog.service';
import {FormBuilder} from '@angular/forms';
import {Subject} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {TrainingProgramService} from '@app/services/training-program.service';
import {TraineeData} from '@app/models/trainee-data';

@Component({
  selector: 'training-program-attendance-popup',
  templateUrl: './training-program-attendance-popup.component.html',
  styleUrls: ['./training-program-attendance-popup.component.scss']
})
export class TrainingProgramAttendancePopupComponent implements OnInit {
  saveAttendance$: Subject<null> = new Subject();
  model!: TrainingProgram;
  operation!: OperationTypes;
  displayedColumns: string[] = ['arName', 'enName', 'department', 'status', 'nationality', 'actions'];

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<TrainingProgram>,
              public lang: LangService,
              public toast: ToastService,
              public dialogRef: DialogRef,
              public dialogService: DialogService,
              private formBuilder: FormBuilder,
              private trainingProgramService: TrainingProgramService) {
    this.operation = data.operation;
    this.model = data.model;
  }

  ngOnInit(): void {
    this.listenToSaveAttendance();
  }

  listenToSaveAttendance() {
    this.saveAttendance$
      .pipe(switchMap(() => {
        return this.trainingProgramService.applyAttendance(this.model.id, this.model.traineeList.map(
          (item) => ({first: item.trainee.id, second: item.isAttended})
        ));
      }))
      .subscribe(() => {
        const message = this.lang.map.attendance_applied_successfully;
        this.toast.success(message);
        this.dialogRef.close(this.model);
      });
  }

  get popupTitle(): string {
    return this.lang.map.training_program_attendance_proof;
  };

  toggleAttendance(event: Event, row: TraineeData) {
    const input = event.target as HTMLInputElement;
    row.isAttended = input.checked;

  }
}
