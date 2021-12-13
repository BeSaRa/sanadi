import {Component, Input, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {TrainingProgram} from '@app/models/training-program';
import {LangService} from '@app/services/lang.service';
import {TraineeData} from '@app/models/trainee-data';
import {takeUntil} from 'rxjs/operators';
import {CertificateService} from '@app/services/certificate.service';
import {Subject} from 'rxjs';

@Component({
  selector: 'trainee-list',
  templateUrl: './trainee-list.component.html',
  styleUrls: ['./trainee-list.component.scss']
})
export class TraineeListComponent implements OnInit, OnChanges, OnDestroy {
  destroy$: Subject<void> = new Subject<void>();
  @Input() trainingProgram!: TrainingProgram;
  model!: TrainingProgram;
  displayedColumns: string[] = ['arName', 'enName', 'department', 'status', 'nationality', 'actions'];
  constructor(public lang: LangService, private certificateService: CertificateService) { }

  ngOnChanges() {
    this.model = (new TrainingProgram()).clone(this.trainingProgram);
    this.model.traineeList = this.model.traineeList.filter(t => t.isAttended);
  }

  ngOnInit(): void {
  }

  downloadCertificate(event: MouseEvent, model: TraineeData) {
    event.preventDefault();
    return this.certificateService.downloadCertificate(this.model.id, model.trainee.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        let downloadURL = window.URL.createObjectURL(data.blob);
        window.open(downloadURL);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
