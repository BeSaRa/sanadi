import {Component, Inject, OnInit} from '@angular/core';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {LangService} from '@app/services/lang.service';
import {TrainingProgram} from '@app/models/training-program';

@Component({
  selector: 'training-briefcase-popup',
  templateUrl: './training-briefcase-popup.component.html',
  styleUrls: ['./training-briefcase-popup.component.scss']
})
export class TrainingBriefcasePopupComponent implements OnInit {
  operation!: number;
  trainingProgram: TrainingProgram;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<TrainingProgram>,
              public lang: LangService) {
    this.trainingProgram = data.model;
    this.operation = data.operation;
  }

  ngOnInit(): void {
  }

}
