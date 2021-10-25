import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {Trainer} from '@app/models/trainer';
import {BlobModel} from '@app/models/blob-model';
import {SafeResourceUrl} from '@angular/platform-browser';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {LangService} from '@app/services/lang.service';

@Component({
  selector: 'trainer-cv-popup',
  templateUrl: './trainer-cv-popup.component.html',
  styleUrls: ['./trainer-cv-popup.component.scss']
})
export class TrainerCvPopupComponent implements OnInit {
  model!: BlobModel;
  trainer!: Trainer;
  resumePath!: SafeResourceUrl;
  @ViewChild('iframe') iframe!: ElementRef<HTMLIFrameElement>;
  show = false;
  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<BlobModel>,
              public lang: LangService) {
    this.model = data.model;
    this.trainer = data.trainer;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.show = true;
    }, 300);
    this.setCurrentResume();
  }

  get popupTitle(): string {
    return "Trainer Number " + this.trainer.id + " CV";
  }

  setCurrentResume() {
    this.resumePath = this.model.safeUrl;
  }

  fullscreen() {
    this.iframe.nativeElement.requestFullscreen().then();
  }

  ngOnDestroy(): void {

  }
}
