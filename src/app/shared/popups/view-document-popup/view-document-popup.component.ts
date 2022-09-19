import {Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DIALOG_DATA_TOKEN} from '../../tokens/tokens';
import {FileNetDocument} from '@app/models/file-net-document';
import {BlobModel} from '@app/models/blob-model';
import {DOCUMENT} from '@angular/common';
import {LangService} from '@services/lang.service';

@Component({
  selector: 'app-view-document-popup',
  templateUrl: './view-document-popup.component.html',
  styleUrls: ['./view-document-popup.component.scss']
})
export class ViewDocumentPopupComponent implements OnInit, OnDestroy {
  model: FileNetDocument;
  blob: BlobModel;
  @ViewChild('iframe') iframe!: ElementRef<HTMLIFrameElement>;
  show: boolean = false;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: { model: FileNetDocument, blob: BlobModel },
              @Inject(DOCUMENT) private document: HTMLDocument,
              public lang: LangService) {
    this.model = data.model;
    this.blob = data.blob;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.show = true;
    }, 300);
  }

  get title(): string {
    if (!this.model || !this.model.documentTitle) {
      return this.lang.map.content;
    }

    return this.model.documentTitle;
  }

  fullscreen() {
    this.iframe.nativeElement.requestFullscreen().then();
  }

  ngOnDestroy(): void {
    this.blob.dispose();
  }
}
