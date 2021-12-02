import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {TrainingProgram} from '@app/models/training-program';
import {LangService} from '@app/services/lang.service';

@Component({
  selector: 'trainee-list',
  templateUrl: './trainee-list.component.html',
  styleUrls: ['./trainee-list.component.scss']
})
export class TraineeListComponent implements OnInit, OnChanges {
  @Input() trainingProgram!: TrainingProgram;
  model!: TrainingProgram;
  displayedColumns: string[] = ['arName', 'enName', 'department', 'status', 'nationality'];
  constructor(public lang: LangService) { }

  ngOnChanges() {
    this.model = (new TrainingProgram()).clone(this.trainingProgram);
    this.model.traineeList = this.model.traineeList.filter(t => t.isAttended);
  }

  ngOnInit(): void {
  }

}
