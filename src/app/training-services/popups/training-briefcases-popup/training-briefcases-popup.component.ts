import {Component, Inject, OnInit} from '@angular/core';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {LangService} from '@app/services/lang.service';
import {TrainingProgram} from '@app/models/training-program';

@Component({
  selector: 'training-briefcases-popup',
  templateUrl: './training-briefcases-popup.component.html',
  styleUrls: ['./training-briefcases-popup.component.scss']
})
export class TrainingBriefcasesPopupComponent implements OnInit {

  trainingProgram: TrainingProgram;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<TrainingProgram>,
              public lang: LangService) {
    this.trainingProgram = data.model;
  }

  ngOnInit(): void {
  }

}
