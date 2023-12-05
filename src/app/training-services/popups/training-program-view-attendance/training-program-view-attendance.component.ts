import {Component, Input, OnInit} from '@angular/core';
import {TrainingProgram} from '@app/models/training-program';
import {LangService} from '@app/services/lang.service';
import {ToastService} from '@app/services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DialogService} from '@app/services/dialog.service';

@Component({
  selector: 'training-program-view-attendance',
  templateUrl: './training-program-view-attendance.component.html',
  styleUrls: ['./training-program-view-attendance.component.scss']
})
export class TrainingProgramViewAttendanceComponent implements OnInit {
  @Input() model!: TrainingProgram;
  displayedColumns: string[] = ['arName', 'enName', 'department', 'externalOrgId', 'status', 'nationality', 'actions'];

  constructor(public lang: LangService,
              public toast: ToastService,
              public dialogRef: DialogRef,
              public dialogService: DialogService) {}

  ngOnInit(): void {

  }

  get popupTitle(): string {
    return this.lang.map.training_program_attendance_proof;
  };
}
